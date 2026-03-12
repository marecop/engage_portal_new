/*global Helpers, moment */

(function(res, helpers) {
    'use strict';

    var baseUrl = '/Services/PupilDetailsServices.asmx';
    var encryptedPupilId;

    function showContent(content) {
        $('.sectionContent .sectionContentInner').append(content).append('<div class="clearfix"></div>').fadeIn();
        // Make points filter responsive
        $('.toggleBar').addClass('form-inline');
        $('.dateToggle').addClass('form-control border0');
        $('.toggleBar > span').addClass('form-control border0 paddingLeft0 marginLeft0');
        $('.toggleBar > input').addClass('form-control marginRight5 marginTop5');
    }

    function removeLoading() {
        $('#js-sectionLoading').remove();
    }

    /* Points functionality */
    var pointsData;
    var pointsTable;
    var fromTo;
    var currentPointsSortExpr = 'pointsDate';

    function createPointsRowFragment(data, sortExpr) {

        var points = data.points;

        points.sort(helpers.sortArray(sortExpr));

        var fragment = document.createDocumentFragment();

        if (points.length === 0) {
            var emptyRow = document.createElement('tr');
            var cell = helpers.createElement('td', '', res.NoPointsFound);
            cell.colSpan = 6;
            emptyRow.appendChild(cell);
            fragment.appendChild(emptyRow);
        } else {
            for (var i = 0; i < points.length; i++) {

                var thisItem = points[i];
                var row = document.createElement('tr');
                var icon = document.createElement('img');
                icon.src = thisItem.pointsTotal < 0 ? '/images/icons/minus.gif' : '/images/icons/plus.gif';
                var iconCell = document.createElement('td');
                iconCell.className = 'center middle';
                iconCell.appendChild(icon);
                row.appendChild(iconCell);

                row.appendChild(helpers.createElement('td', 'nowrap', moment(thisItem.pointsDate).format('Do MMM YYYY')));
                row.appendChild(helpers.createElement('td', '', thisItem.awardedBy));

                row.appendChild(helpers.createElement('td', '', thisItem.pointsType));
                row.appendChild(helpers.createElement('td', '', thisItem.notes));

                row.appendChild(helpers.createElement('td', 'alignright', thisItem.pointsTotal));

                fragment.appendChild(row);
            }
            var totalRow = document.createElement('tr');
            var labelText = res.NegativePoints + ':' + '<br />'
                + res.PositivePoints + ':' + '<br />'
                + res.TotalPoints + ':';

            var totalLabel = helpers.createElement('td', 'bold alignright', labelText, true);
            totalLabel.colSpan = 5;
            totalRow.appendChild(totalLabel);

            var totalText = data.filteredNegativePoints + '<br />'
                + data.filteredPositivePoints + '<br />'
                + (data.filteredNegativePoints + data.filteredPositivePoints);

            totalRow.appendChild(helpers.createElement('td', 'alignright', totalText, true));
            fragment.appendChild(totalRow);
        }
        return fragment;
    }

    function renderPointsSection(pupilId) {
        var pointsSuccess = function (data) {
            
            pointsData = JSON.parse(data.d);

            var div = document.createElement('div');
            var from = moment(pointsData.dateFrom);
            var to = moment(pointsData.dateTo);

            var string = res.PointsFromTo.format(from.format('Do MMMM YYYY'), to.format('Do MMMM YYYY'));

            fromTo = helpers.createElement('h2', '', string, true);
            div.appendChild(fromTo);

            var filterHolder = helpers.createElement('div', 'toggleBar');

            var picker = new DwmtyPicker();
            filterHolder.appendChild(picker.render());

            picker.setFromDate(from);
            picker.setToDate(to);
            
            var button = helpers.createElement('input', 'btn btn-primary btn-mini');
            button.type = 'button';
            button.value = res.Search;

            $(button).on('click', function() {
                var p = {
                    'encryptedPupilId': pupilId,
                    'dateFrom': picker.getFromDate(),
                    'dateTo': picker.getToDate()
                };

                var okFunction = function(d) {
                    $('tr:not(:first)', pointsTable).remove();
                    pointsData = JSON.parse(d.d);
                    pointsTable.appendChild(createPointsRowFragment(pointsData, '-pointsDate'));
                    from = moment(pointsData.dateFrom);
                    to = moment(pointsData.dateTo);
                    $(fromTo).text(res.PointsFromTo.format(from.format('Do MMMM YYYY'), to.format('Do MMMM YYYY')));
                };

                helpers.ajaxCall(baseUrl + '/GetPupilPointsDataByDate', p, okFunction, helpers.ajaxFailure, removeLoading);
                picker.getFromDate();
            });
            filterHolder.appendChild(button);

            div.appendChild(filterHolder);
           
            pointsTable = document.createElement('table');
            pointsTable.border = 1;
            pointsTable.cellpadding = 2;
            pointsTable.cellspacing = 2;
            pointsTable.className = 'tabledata sortable';

            var headerRow = document.createElement('tr');
            headerRow.id = 'pointsHeaderRow';
            headerRow.appendChild(helpers.createElement('th', 'width16', '', false));
                        
            var cell1 = helpers.createElement('th', '', 'Date', false);
            cell1.setAttribute('data-sortexpr', 'pointsDate');
            var sortIcon = document.createElement('img');
            sortIcon.id = 'pointsSortIcon';
            sortIcon.src = '/images/icons/downArrow.gif';
            sortIcon.className = 'marginLeft5';
            cell1.appendChild(sortIcon);
            headerRow.appendChild(cell1);

            var cell2 = helpers.createElement('th', '', 'Awarded By', false);
            cell2.setAttribute('data-sortexpr', 'awardedBy');
            headerRow.appendChild(cell2);

            var cell3 = helpers.createElement('th', '', 'Type', false);
            cell3.setAttribute('data-sortexpr', 'pointsType');
            headerRow.appendChild(cell3);

            var cell4 = helpers.createElement('th', '', 'Notes', false);
            cell4.setAttribute('data-sortexpr', 'notes');
            headerRow.appendChild(cell4);

            var cell5 = helpers.createElement('th', 'width80', res.Points, false);
            cell5.setAttribute('data-sortexpr', 'pointsTotal');
            headerRow.appendChild(cell5);

            pointsTable.appendChild(headerRow);

            pointsTable.appendChild(createPointsRowFragment(pointsData, '-pointsDate'));

            div.appendChild(pointsTable);
            showContent(div);

            $('th:parent', pointsTable).off('click').on('click', function () {
                if (pointsData === undefined) {
                    return;
                }

                var sortCol = $(this).data('sortexpr');

                // strip the '-' off the current sort expr to compare it to the new sort expression
                var currentSortCol = currentPointsSortExpr[0] === '-' ? currentPointsSortExpr.substr(1) : currentPointsSortExpr;
                // is the new sort column the same as the current column?
                if (sortCol === currentSortCol) {
                    // if the current sort has a '-' remove it, other wise add it
                    sortCol = currentPointsSortExpr[0] === '-' ? currentPointsSortExpr.substr(1) : '-' + currentPointsSortExpr;
                } else {
                    $(this).append($('#pointsSortIcon'));
                }
                // store sort colum
                currentPointsSortExpr = sortCol;

                document.getElementById('pointsSortIcon').src = currentPointsSortExpr[0] === '-' ? '/images/icons/upArrow.gif' : '/images/icons/downArrow.gif';

                $(pointsTable).find('tr:not("#pointsHeaderRow")').remove();
                pointsTable.appendChild(createPointsRowFragment(pointsData, sortCol));
            });

        }

        helpers.ajaxCall(baseUrl + '/GetPupilPointsData', { 'encryptedPupilId': pupilId }, pointsSuccess, helpers.ajaxFailure, removeLoading);
    }
    /* end points functionality*/

    /* reports functionality */
    var assessmentReportsData;
    var assessmentReportPeriodData;
    var reportsTable;
    var ddlAcademicYear, ddlReportingPeriod;

    function createReportsRowFragment(data) {

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {

            var thisItem = data[i];
            var row = document.createElement('tr');

            var link = document.createElement('a');
            link.href = thisItem.Uri;
            link.title = thisItem.Summary;
            link.target = '_blank';
            link.setAttribute('rel', 'nofollow me noopener noreferrer'); /*DFEduMIS.DF.Common.Utilities.Constants.HtmlSecurity.RelTagContents*/

            var icon = document.createElement('img');
            icon.src = '/images/icons/pdf.gif';
            link.appendChild(icon);

            var iconCell = document.createElement('td');
            iconCell.className = '';
            iconCell.appendChild(link);
            row.appendChild(iconCell);

            var textLink = link.cloneNode();
            setText(textLink, thisItem.Title, false);

            var textLinkCell = document.createElement('td');
            textLinkCell.appendChild(textLink);

            row.appendChild(textLinkCell);
            row.appendChild(helpers.createElement('td', 'center', thisItem.AcademicYearText));
            row.appendChild(helpers.createElement('td', 'center', moment(thisItem.CreatedDate).format('Do MMM YYYY')));
            row.appendChild(helpers.createElement('td', 'center', moment(thisItem.ModifiedDate).format('Do MMM YYYY')));

            fragment.appendChild(row);
        }

        return fragment;
    }

    function addAllItem(ddl, includesSelectItem) {
        var all = helpers.createElement('option', '', res.All);
        all.value = 'all';

        var target;
        // some ddl's have a 'select' item, others dont. we want to insert the 'all' item after
        // the 'select' items if its there
        if (includesSelectItem === true) {
            target = ddl.firstChild.nextSibling;
        } else {
            target = ddl.firstChild;
        }

        ddl.insertBefore(all, target);
    }

    function assessmentReportAcademicYearChange() {
        // clear any items in the ddl
        helpers.removeAllChildren(ddlReportingPeriod);

        // could have used this.value but that doesnt work if you've called the function manually
        var selectedValue = ddlAcademicYear[ddlAcademicYear.selectedIndex].value;

        // helper method to filter data based on academic year
        var arrFilter = function(item) {
            return (this.AcademicYear === 'all' || item.AcademicYear === parseInt(this.AcademicYear));
        }

        // filter the data to find RP's from the selected academic year
        var filteredData = assessmentReportPeriodData.filter(arrFilter, { AcademicYear: selectedValue });

        // bind dropdown with filtered RPs
        for (var i = 0; i < filteredData.length; i++) {
            var thisItem = filteredData[i];
            var textVal = thisItem.Name;
            if (selectedValue === 'all') {
                textVal += ' (' + thisItem.AcademicYearText + ')';
            }
            var item = helpers.createElement('option', '', textVal);
            item.value = thisItem.AcademicYear + '|' + thisItem.ReportingPeriodId;
            ddlReportingPeriod.appendChild(item);
        }

        addAllItem(ddlReportingPeriod);
        ddlReportingPeriod.disabled = (ddlReportingPeriod.length <= 1); // 1 because there will always be an 'all' item
        assessmentReportReportingPeriodChange();
    }

    function assessmentReportReportingPeriodChange() {
        // helper method to filter reports by RP and academic year        
        var arrFilter = function(item) {
            // 'this' is the 2nd parameter passed in to the filter function below

            // both filters set to all - return everything
            if (this.AcademicYearFilter === 'all' && this.ReportingPeriodFilter === 'all') {
                return true;
            }

            // academic year and any all RPs selected
            if (this.AcademicYearFilter !== '' & this.AcademicYearFilter !== 'all' & this.ReportingPeriodFilter === 'all') {
                return item.AcademicYear === parseInt(this.AcademicYearFilter);
            }

            // reporting period selected - check acYr and RP
            if (this.ReportingPeriodFilter !== '' & this.ReportingPeriodFilter !== 'all') {
                return item.AcademicYear + '|' + item.ReportingPeriodID === this.ReportingPeriodFilter;
            }

            // all other scenarios
            return false;
        }

        // could have used this.value but that doesnt work if you've called the function manually
        var selectedValue = ddlReportingPeriod[ddlReportingPeriod.selectedIndex].value;

        // filter reports to find those from this RP and acYr
        var filteredData = assessmentReportsData.filter(arrFilter, { AcademicYearFilter: ddlAcademicYear[ddlAcademicYear.selectedIndex].value, ReportingPeriodFilter: selectedValue });

        // sort data by last modified date desc
        filteredData.sort(helpers.sortArray('-ModifiedDate'));
        
        // clear all rows apart from the header from the table
        $(reportsTable).find('tr:not("#assessmentReportsHeader")').remove();

        if (filteredData.length > 0) {
            // create report grid html
            reportsTable.appendChild(createReportsRowFragment(filteredData));
        } else {
            // create empty row
            reportsTable.appendChild(createEmptyReportTableRow());
        }
    }

    function createEmptyReportTableRow() {
        var emptyRow = document.createElement('tr');
        var emptyCell = helpers.createElement('td', '', res.UseFiltersForAssessments);
        emptyCell.colSpan = 5;
        emptyRow.appendChild(emptyCell);
        return emptyRow;
    }

    function renderAssessmentReports(pId) {

        var data = {
            'encryptedPupilID': pId,
            'reportingPeriod': '', 
            'academicYear': 0,
            'showAllReports': true
        };

        var assessmentsSuccess = function (assData) {
            assessmentReportsData = JSON.parse(assData.d);
            var holder = document.createElement('div');

            var toggleBar = helpers.createElement('div', 'toggleBar form-inline marginBottom20');

            var acYearSpan = helpers.createElement('span', 'form-control', res.AcademicYear + ': ');
            ddlAcademicYear = helpers.createElement('select', 'form-control marginRight10');
            toggleBar.appendChild(acYearSpan);
            toggleBar.appendChild(ddlAcademicYear);

            var reportingSpan = helpers.createElement('span', 'form-control', res.ReportingPeriod + ': ');
            ddlReportingPeriod = helpers.createElement('select', 'form-control');
            toggleBar.appendChild(reportingSpan);
            toggleBar.appendChild(ddlReportingPeriod);

            holder.appendChild(toggleBar);
                        
            if (assessmentReportsData.length > 0) {

                helpers.ajaxCall(baseUrl + '/GetReportingAssessmentReportingPeriods', { 'encryptedPupilID': pId }, function (rpData) {
                    assessmentReportPeriodData = JSON.parse(rpData.d);
                    // variable to store unique academic years to bind to ddl
                    var uniqueYears = [];
                    for (var i = 0; i < assessmentReportPeriodData.length; i++) {
                        var currentItem = assessmentReportPeriodData[i];
                        // do we already have this reporting period?
                        if (!helpers.arrayContains(uniqueYears, 'AcademicYear', currentItem.AcademicYear)) {
                            uniqueYears.push({ AcademicYear: currentItem.AcademicYear, AcademicYearText: currentItem.AcademicYearText }); // add reporting period to array
                        }
                    }
                    // add academic years to drop down
                    ddlAcademicYear.appendChild(helpers.createDropDownItems(uniqueYears, 'AcademicYearText', 'AcademicYear', true, ''));
                    addAllItem(ddlAcademicYear, true);

                    // add 'select' to ddl and disable it
                    ddlReportingPeriod.appendChild(helpers.createDropDownItems([], '', '', true, ''));
                    ddlReportingPeriod.disabled = true;

                    // wire up change events
                    $(ddlAcademicYear).off('change').on('change', assessmentReportAcademicYearChange);
                    $(ddlReportingPeriod).off('change').on('change', assessmentReportReportingPeriodChange);

                    // default list of reports to this year or 'all'
                    var currentYear = new Date().getFullYear();
                    var currentYearReports = $.grep(assessmentReportPeriodData, function (e) { return e.AcademicYear === currentYear; });
                    ddlAcademicYear.value = currentYearReports.length > 0 ? currentYearReports[0].AcademicYear : 'all';
                    assessmentReportAcademicYearChange();
                    
                }, helpers.ajaxFailure);

                reportsTable = document.createElement('table');
                reportsTable.border = 1;
                reportsTable.cellpadding = 2;
                reportsTable.cellspacing = 2;
                reportsTable.className = 'tabledata';
                reportsTable.style.tableLayout = "fixed";
                reportsTable.style.width = '100%';

                var headerRow = document.createElement('tr');
                headerRow.id = 'assessmentReportsHeader';
                var iconHeader = document.createElement('th');
                iconHeader.style.width = '42px';
                headerRow.appendChild(iconHeader);
                headerRow.appendChild(helpers.createElement('th', '', 'Report Name', false));
                headerRow.appendChild(helpers.createElement('th', '', res.AcademicYear, false));
                headerRow.appendChild(helpers.createElement('th', 'width120', 'Created Date', false));
                headerRow.appendChild(helpers.createElement('th', 'width120', 'Modified Date', false));

                reportsTable.appendChild(headerRow);
                reportsTable.appendChild(createEmptyReportTableRow());

                holder.appendChild(reportsTable);
            } else {
                ddlAcademicYear.disabled = true;
                ddlReportingPeriod.disabled = true;

                var noReports = helpers.createElement('div', 'alert alert-error', res.NoReportsFoundHeading);

                holder.appendChild(noReports);
            }

            showContent(holder);
        }

        helpers.ajaxCall(baseUrl + '/GetPupilAssessmentReports', data, assessmentsSuccess, helpers.ajaxFailure, removeLoading);
    }
    /* end reports functionality */

    function getPupilDetails(pId, sectionType) {
        var simpleSecionSuccess = function(data) {
            var $grid = $('.js-PupilDetailSectionContent', $(data.d));
            showContent($grid.children().removeClass('left width300'), sectionType);
            var es = $('.js-ppEvalScript').text();
            if (es)
                eval(es);
        }

        var params = {
            'encryptedPupilID': pId,
            'sectionType': sectionType
        };

        helpers.ajaxCall(baseUrl + '/RenderSimpleSection', params, simpleSecionSuccess, helpers.ajaxFailure, removeLoading);
    }

    function resetUi() {
        $('.myDetailsContainer .active').removeClass('active');
        $('.sectionContent').remove();
    }

    $(document).ready(function () {

        var itemsPerRow = 4;
        var itemCount = $('.myDetailsContainer .section').length;
        var selected = getURLParameter('detail');

        encryptedPupilId = $('input[id$="hdnPupilID"]').val();
        
        $('.section').off('click').on('click', function () {
            var clicked = $(this).parent('.section');

            var tabCount = $('ul.nav-tabs > li').length;
            if (tabCount == 1) {
                if ($('.sectionContentInner').length == 1) return;
            }

            // was the item that was clicked already open? 
            // we want to close it nicely if it was
            var close = clicked.data('open') === 'true';

            // remove any 'open' flags
            $('.myDetailsContainer .section').removeData('open');

            if (close === true) {
                // slide the content up then reset the ui
                $('.sectionContent').slideUp(resetUi);
                return;
            }

            resetUi();

            clicked.data('open', 'true').addClass('active');

            // what is the index of the button that was clicked?
            var itemIndex = clicked.index('.section');

            // which row is the item in? Needs to be 1 based
            var thisRow = parseInt(itemIndex / itemsPerRow) + 1;

            // need to find the last item in the row
            var item = (itemsPerRow * thisRow);
            if (item > itemCount) {
                item = itemCount;
            }
            var sectionType = $(this).data('section');
            //#4422 don't show the loading gif if showing assessments as it is a hidden control that just needs to be made visible
            if (sectionType !== 'Assessments2') {
                $('.' + sectionType).eq(item - 1).after('<div class="sectionContent clearboth paddingRight10 paddingBottom10 animated-panel zoomIn" style="animation-delay: 0.3s;"><img id="js-sectionLoading" src="/images/loading.gif" style="display:block;margin:0 auto;" /><div class="none sectionContentInner"></div></div>');
            }
            // if this is the first item in a row do round the corner of the content div
            if (itemIndex % itemsPerRow === 0) {
                $('.sectionContent').css('border-top-left-radius', '0');
            }
            $('.performanceTrackerDiv').hide();

            switch (sectionType) {
            case 'Siblings':
                $('.sectionContent').removeClass('minWidth640');
                getPupilDetails(encryptedPupilId, sectionType);
                break;
            case 'Points':
                $('.sectionContent').removeClass('minWidth640');
                renderPointsSection(encryptedPupilId);
                break;
            case 'Assessments':
                $('.sectionContent').removeClass('minWidth640');
                renderAssessmentReports(encryptedPupilId);
                break;
                case 'Assessments2':
                $('.sectionContent').removeClass('minWidth640');
                $('.performanceTrackerDiv').show(); //#4422 not loaded dynamically from web service as telerik controls don't support it
               break;
            default:
                $('.sectionContent').addClass('minWidth640');
                getPupilDetails(encryptedPupilId, sectionType);
                break;
            }
        });

        // if there arent enough sections to fill a row adjust the widths to compensate
        if ((itemCount < itemsPerRow) && (itemCount > 1)) {
            $('.myDetailsContainer .section').css('width', ((90 / itemCount) + '%'));
        }

        // create a list of classes to change the text colour of the sections
        var classList = ['blue-text', 'red-text', 'orange-text', 'green-text', 'purple-text'];

        // loop through each section and give it a class from the array
        $('.section').each(function (index) {
            $(this).addClass(classList[index % classList.length]);
        });
        
        // if there is only one section, open it
        if ($('.section span').length === 1) {
            $('.section span')[0].click();
        }

        $('a[data-section="' + selected + '"]').trigger('click');
    });
    
}(Resources, Helpers));