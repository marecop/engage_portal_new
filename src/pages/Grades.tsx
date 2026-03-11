import { PageTransition } from "../components/PageTransition";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ChevronDown, FileText, Check } from "lucide-react";

export default function Grades() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pupilId, setPupilId] = useState<string>("");
  
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  
  const [reportingPeriods, setReportingPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  // marksheet.rows will now be an array of string arrays (transposed)
  const [marksheet, setMarksheet] = useState<{headers: string[], rows: string[][]}>({ headers: [], rows: [] });
  const [loadingMarksheet, setLoadingMarksheet] = useState(false);

  const getToken = () => localStorage.getItem('authToken');

  const fetchApi = async (action: string, context: any) => {
    const token = getToken();
    const res = await fetch(`/api/report-services/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ context })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.d || data;
  };

  // 1. Initial Load: Get Pupil ID and Academic Years
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const idRes = await fetch(`/api/pupil-id`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!idRes.ok) throw new Error(`Failed to fetch Pupil ID`);
        const idData = await idRes.json();
        setPupilId(idData.pupilId);

        const years = await fetchApi('GetMarksheetAcademicYears', { Text: "", NumberOfItems: 0 });
        setAcademicYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0].Value);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. When Year changes, get Reporting Periods
  useEffect(() => {
    const loadPeriods = async () => {
      if (!selectedYear) return;
      try {
        setLoadingPeriods(true);
        const periods = await fetchApi('GetReportingPeriods', { Text: "", NumberOfItems: 0, academicYears: selectedYear });
        setReportingPeriods(periods);
        if (periods.length > 0) {
          const defaultPeriod = periods.find((p: any) => p.Attributes?.Checked) || periods[0];
          setSelectedPeriod(defaultPeriod.Value);
        } else {
          setSelectedPeriod("");
          setMarksheet({ headers: [], rows: [] });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingPeriods(false);
      }
    };
    loadPeriods();
  }, [selectedYear]);

  // 3. When Period or showDetails changes, fetch the full marksheet
  useEffect(() => {
    const loadMarksheet = async () => {
      if (!selectedYear || !selectedPeriod || !pupilId) return;
      
      if (!selectedPeriod.includes(selectedYear)) {
          return; 
      }

      try {
        setLoadingMarksheet(true);
        setError(null); 
        const periodShort = selectedPeriod.split('|').pop();

        const yearGroups = await fetchApi('GetYearGroups', { Text: "", NumberOfItems: 0, academicYears: selectedYear, reportingPeriods: periodShort });
        const yearGroup = yearGroups[0]?.Value;
        if (!yearGroup) {
          setMarksheet({ headers: [], rows: [] });
          setLoadingMarksheet(false);
          return;
        }

        const subjects = await fetchApi('GetPupilMarksheetSubjects', { Text: "", NumberOfItems: 0, academicYears: selectedYear, reportingPeriods: selectedPeriod, yearGroups: yearGroup });
        const subjectList = subjects.map((s: any) => s.Value).join(',');

        const divisions = await fetchApi('GetPupilMarksheetDivisions', { Text: "", NumberOfItems: 0, academicYears: selectedYear, reportingPeriods: periodShort, yearGroups: yearGroup, subjects: subjectList });
        const divisionList = divisions.map((d: any) => d.Value).join(',');

        const classes = await fetchApi('GetPupilMarksheetClasses', { Text: "", NumberOfItems: 0, academicYears: selectedYear, reportingPeriods: periodShort, yearGroups: yearGroup, subjects: subjectList, divisions: divisionList });
        const batchList = classes.map((c: any) => c.Value).join(',');

        let columnList = "";
        if (showDetails) {
          const columns = await fetchApi('GetColumnsForSubjects', { 
            Text: "", NumberOfItems: 0, 
            academicYears: selectedYear, 
            reportingPeriods: selectedPeriod, 
            yearGroupList: yearGroup, 
            subjectList: subjectList, 
            divisionList: divisionList, 
            batchList: batchList 
          });
          columnList = columns.map((c: any) => c.Value).join(',');
        }

        const marksheetPayload = {
          academicYear: selectedYear,
          reportingPeriodList: selectedPeriod,
          yearGroupList: yearGroup,
          subjectList: subjectList,
          divisionList: divisionList,
          batchList: batchList,
          columnList: columnList,
          pupilIDs: pupilId,
          uniqueID: "Portal_PupilDetails",
          setAsPreference: true,
          defaultReportingPeriod: "",
          pageIndex: "0",
          sortField: "Surname",
          sortDirection: "ASC",
          sortable: true,
          showPupilName: false,
          allowCollapseMarksheetColumns: "true",
          enableFrozenHeadings: false,
          filterSearch: true,
          page: 1,
          pageSize: 500
        };

        const token = getToken();
        const res = await fetch(`/api/report-services/RenderPupilMarksheet`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(marksheetPayload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const marksheetData = await res.json();
        
        let htmlStr = marksheetData.d || marksheetData;
        if (typeof htmlStr !== 'string') {
            htmlStr = JSON.stringify(htmlStr);
        }

        // Bulletproof HTML Parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlStr, 'text/html');
        
        const tables = Array.from(doc.querySelectorAll('table'));
        if (tables.length === 0) {
            setMarksheet({ headers: [], rows: [] });
            setLoadingMarksheet(false);
            return;
        }

        // Find the table with the most rows (most likely the data table)
        let targetTable = tables.find(t => t.classList.contains('rgMasterTable'));
        if (!targetTable) {
            targetTable = tables.sort((a, b) => b.querySelectorAll('tr').length - a.querySelectorAll('tr').length)[0];
        }

        const allRows = Array.from(targetTable.querySelectorAll('tr'));
        if (allRows.length === 0) {
            setMarksheet({ headers: [], rows: [] });
            setLoadingMarksheet(false);
            return;
        }

        // 1. Find Header Row robustly
        const headerRow = allRows.reduce((prev, current) => {
            const prevCount = prev.querySelectorAll('th, .rgHeader').length;
            const currentCount = current.querySelectorAll('th, .rgHeader').length;
            return currentCount > prevCount ? current : prev;
        }, allRows[0]);

        const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
        const parsedHeaders = headerCells.map(c => c.textContent?.replace(/\s+/g, ' ').trim() || '');

        // 2. Find Data Rows
        const parsedRows: any[] = [];
        const headerIdx = allRows.indexOf(headerRow);
        
        for (let i = headerIdx + 1; i < allRows.length; i++) {
            const tr = allRows[i];
            // Skip pager, footer, or group header rows
            if (tr.classList.contains('rgPager') || tr.classList.contains('rgFooter') || tr.classList.contains('rgGroupHeader')) continue;
            
            const cells = Array.from(tr.querySelectorAll('td'));
            if (cells.length === 0) continue;

            const rowData: Record<string, string> = {};
            
            // Telerik grids often have an expander column at the start. 
            // If there are more cells than headers, align from the right.
            const offset = Math.max(0, cells.length - parsedHeaders.length);
            
            parsedHeaders.forEach((header, idx) => {
                if (header) {
                    rowData[header] = cells[idx + offset]?.textContent?.replace(/\s+/g, ' ').trim() || '';
                }
            });
            
            // Only add if there is some actual text content
            if (Object.values(rowData).some(v => v !== '')) {
                parsedRows.push(rowData);
            }
        }

        const visibleHeaders = parsedHeaders.filter(h => h !== '');

        if (visibleHeaders.length > 0 && parsedRows.length > 0) {
            // Transpose the table
            // Find the index of the "Subject" column (usually the first one, but let's be safe)
            const subjectColName = visibleHeaders.find(h => h.toLowerCase().includes('subject')) || visibleHeaders[0];
            
            const transposedHeaders = ['Assessment', ...parsedRows.map(r => r[subjectColName] || 'Unknown')];
            const transposedRows: string[][] = [];

            const originalHeadersToRows = visibleHeaders.filter(h => h !== subjectColName);

            originalHeadersToRows.forEach(origHeader => {
                const newRow: string[] = [origHeader];
                parsedRows.forEach(origRow => {
                    newRow.push(origRow[origHeader] || '');
                });
                transposedRows.push(newRow);
            });

            setMarksheet({ headers: transposedHeaders, rows: transposedRows });
        } else {
            setMarksheet({ headers: [], rows: [] });
        }

      } catch (err: any) {
        console.error("Marksheet fetch error:", err);
        setError(err.message);
      } finally {
        setLoadingMarksheet(false);
      }
    };
    
    loadMarksheet();
  }, [selectedPeriod, selectedYear, pupilId, showDetails]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-black/20 mb-4" />
          <p className="text-[#1D1D1F] font-medium">Loading Grades...</p>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="bg-[#FFF0F0] text-[#FF3B30] p-4 rounded-2xl flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[40px] leading-tight font-semibold tracking-tight text-[#1D1D1F]">
              Grades
            </h1>
            <p className="text-[17px] text-[#86868B] mt-1 font-medium">
              Your academic performance and assessments.
            </p>
          </div>
          
          {/* Toggle for Detailed Assessments */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            disabled={loadingPeriods || loadingMarksheet}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 ${
              showDetails 
                ? 'bg-[#1D1D1F] text-white shadow-md' 
                : 'bg-white text-[#1D1D1F] border border-[#E5E5EA] hover:bg-[#F5F5F7]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              showDetails ? 'border-white bg-white' : 'border-[#C7C7CC] bg-transparent'
            }`}>
              {showDetails && <Check className="w-3 h-3 text-[#1D1D1F]" />}
            </div>
            Show Detailed Assessments
          </button>
        </div>

        {/* Selectors - Apple Style Pill/Card */}
        <div className="bg-[#F5F5F7] p-2 rounded-[24px] flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <select 
              className="w-full appearance-none bg-white border-none rounded-[18px] py-3.5 pl-5 pr-10 text-[15px] font-medium text-[#1D1D1F] shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer disabled:opacity-50"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={loadingPeriods || loadingMarksheet}
            >
              {academicYears.map(year => (
                <option key={year.Value} value={year.Value}>{year.Text}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
          </div>
          
          <div className="relative flex-1">
            <select 
              className="w-full appearance-none bg-white border-none rounded-[18px] py-3.5 pl-5 pr-10 text-[15px] font-medium text-[#1D1D1F] shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={loadingPeriods || loadingMarksheet}
            >
              {loadingPeriods ? (
                <option value="">正在获取信息...</option>
              ) : (
                reportingPeriods.map(period => (
                  <option key={period.Value} value={period.Value}>{period.Text}</option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
          </div>
        </div>

        {/* Data Display */}
        {loadingMarksheet ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-[#E5E5EA]">
            <Loader2 className="w-8 h-8 animate-spin text-black/20 mb-4" />
            <p className="text-[#86868B] font-medium">Fetching assessments...</p>
          </div>
        ) : marksheet.rows.length > 0 ? (
          <div className="bg-white rounded-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-[#E5E5EA] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr>
                    {marksheet.headers.map((header, idx) => (
                      <th 
                        key={idx}
                        className={`px-6 py-4 text-[13px] font-semibold text-[#86868B] border-b border-[#E5E5EA] whitespace-nowrap bg-[#FBFBFD] sticky top-0 z-10 ${
                          idx === 0 ? 'text-left left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]' : 'text-center'
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {marksheet.rows.map((row, rowIdx) => {
                    const assessmentName = row[0];
                    // Check if this row is metadata (Division, Class, Teacher)
                    const isMetadata = ['division', 'class', 'teacher', 'set'].some(meta => assessmentName.toLowerCase().includes(meta));

                    return (
                      <tr key={rowIdx} className="hover:bg-[#F5F5F7]/60 transition-colors duration-200 group">
                        {row.map((cellValue, colIdx) => {
                          const isAssessmentCol = colIdx === 0;
                          
                          // Check if the cell value looks like a score (number or letter grade)
                          const isScore = !isAssessmentCol && !isMetadata && cellValue !== '' && (
                            !isNaN(Number(cellValue)) || 
                            /^[A-E]\*?$/.test(cellValue) || 
                            /^\d+%$/.test(cellValue)
                          );
                          
                          return (
                            <td 
                              key={colIdx} 
                              className={`px-6 py-4 whitespace-nowrap text-[14px] ${
                                isAssessmentCol 
                                  ? 'font-semibold text-[#1D1D1F] sticky left-0 bg-white group-hover:bg-[#F5F5F7]/60 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors duration-200' 
                                  : isMetadata 
                                    ? 'font-medium text-[#424245] text-center'
                                    : 'text-center'
                              }`}
                            >
                              {isScore ? (
                                <span className="inline-flex items-center justify-center min-w-[32px] h-[32px] px-2 rounded-lg bg-[#007AFF]/10 text-[#007AFF] font-semibold">
                                  {cellValue}
                                </span>
                              ) : (
                                <span className={!isAssessmentCol && !isMetadata ? 'text-[#86868B]' : ''}>
                                  {cellValue || '-'}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-[#E5E5EA] py-32 text-center">
            <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#86868B]" />
            </div>
            <h3 className="text-[19px] font-semibold text-[#1D1D1F] mb-1">No Assessments Found</h3>
            <p className="text-[15px] text-[#86868B]">There is no data available for this reporting period.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
