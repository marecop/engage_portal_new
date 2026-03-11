import requests
import re

# ======================= 配置 =======================
COOKIE = "LanguageID=CHN; ASP.NET_SessionId=ndam2ciggnb2vbkvqiffnpay; pwaBannerDisplayed=never; .ASPXFORMSAUTH=5BEE25304AB959474DBCF5BD2C81BC3F4E7473507BF240E9140C9BA8E3D7D52023E410B60F40060BD0766D490B1E4A503C34505CE3A56A3E8D9C53A8B13DA25D0B396083EE8DAA555DE94549951E00C8FDF9035278B28ADF5D2479C1E100BDE860C99602D88C0813035B1F1F334B3CC1B2851A54"
# ====================================================

url = "https://ulinkcollege.engagehosted.cn/VLE/pupildetails.aspx?detail=PupilDetails"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Cookie": COOKIE,
    "Referer": "https://ulinkcollege.engagehosted.cn/VLE/"
}

# 1. 获取个人详情页面（GET，就是你抓到的这个）
response = requests.get(url, headers=headers)
html = response.text

# 2. 【核心】自动提取当前登录人的 pupilID（内部数字ID）
def get_pupil_id(html):
    patterns = [
        r'pupilIDs?:\s*["\'](\d+)["\']',          
        r'Pupil[^=]*?=\s*["\'](\d+)["\']',        
        r'value=["\'](\d{3,5})["\']',             
        r'pupil.*?["\'](\d+)["\']',               
        r'(\d{4})'                                
    ]
    for pattern in patterns:
        match = re.search(pattern, html)
        if match:
            return match.group(1)
    return None

pupil_id = get_pupil_id(html)

# ======================= 输出结果 =======================
print("="*60)
if pupil_id:
    print(f"✅ 动态获取成功！")
    print(f"🔑 当前登录账号的 pupilID = {pupil_id}")
    print(f"📌 这个ID可以直接放进成绩接口！")
else:
    print("❌ 未找到，请在页面源码搜索 Pupil 或 4位数字")
print("="*60)