//DOM
const selectZone = document.querySelector("#zoneSelect");
const selectHotItems = document.querySelector("#hotItems");
const page = document.querySelector("#pageContainer");
const dataBlock = document.querySelector("#dataContainer");
const zoneTitle = document.querySelector("#zoneTitle");
const slideBtn = document.querySelector("#slideBtn");
const slideMenu = document.querySelector("#slidemenu");

slideBtn.addEventListener("click", function(e) {
    slideMenu.style.display = "block";
    slideMenu.style.display = "block";
    document.querySelector("#closeMenu").style.display = "block";
});

document.querySelector("#closeMenu").addEventListener("click", function(e) {
    console.log(e.target);
    if (e.target !== slideMenu) {
        slideMenu.style.display = "none";
        document.querySelector("#closeMenu").style.display = "none";
    }
});

selectZone.addEventListener("change", changeZone); //用change不是click
page.addEventListener("click", clickPage);
selectHotItems.addEventListener("click", clickHotZone);
selectHotItems.addEventListener("mouseover", function(e) {
    if (e.target.nodeName == "LI") {
        e.target.setAttribute("class", "col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3");
    } else if (e.target.nodeName == "A") {
        //Ａ的父元素，指的是LI
        e.target.parentElement.setAttribute("class", "col-3");

    }

});
selectHotItems.addEventListener("mouseout", function(e) {
    if (e.target.nodeName == "LI") {
        e.target.setAttribute("class", "col-2");
    } else if (e.target.nodeName == "A") {
        e.target.parentElement.setAttribute("class", "col-2 col-xl-2 col-lg-2 col-md-2 col-sm-2 ");
    }

});


// Model 
const allData = []; //所有資料
const zoneData = []; //和點選到的地區有關的資料

//IIFE函式
//讀取API資料
(function getData() {
    //建立 XML 物件
    const url = "https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97";
    const request = new XMLHttpRequest();
    //設定請求
    request.open('get', url);
    //用.onreadystatechange指名要負責處理回傳值得的函式
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            //將回傳的資料轉為物件
            const data = JSON.parse(request.responseText);
            const dataLen = data.result.records.length;
            //將data中有關每區的資訊取出，存入allData
            for (let i = 0; i < dataLen; i++) {
                allData.push(data.result.records[i]);
            }
            updataMenu(allData);
            pagination(allData, 1);
            // console.log(dataLen);
        }
    };
    request.send(null);
})();

//讓下拉式選單有各區的名稱
function updataMenu(parameter) {
    //parameter為全域 allData
    //存所有地區的名稱
    const allZoneName = [];
    parameter.forEach(function(e) {
        // 當allZoneName中沒有每個地區的名稱時，會加入
        if (allZoneName.indexOf(e.Zone) == -1) {
            allZoneName.push(e.Zone);
        }
    });
    //view 
    //原先下拉式選單只有「全部地區」選項，現在讓下拉式選單中有每個地區的名稱
    for (let i = 0; i < allZoneName.length; i++) {
        const addOption = document.createElement('Option');
        addOption.textContent = allZoneName[i];
        addOption.setAttribute("value", allZoneName[i]);
        selectZone.appendChild(addOption);
    }
    zoneTitle.textContent = "全部地區";
}

//點擊下拉式選單中的地區時執行
function changeZone(e) {
    //先清空zoneData中的值
    zoneData.length = 0;
    //將zoneTitle設定為點到的option值
    zoneTitle.textContent = e.target.value;
    switch (true) {
        case e.target.value !== "全部地區":
            // console.log(e.target.value);
            for (let i = 0; allData.length > i; i++) {
                //把與所選到的地區名稱相同的資料push到zoneData中
                if (e.target.value === allData[i].Zone) {
                    zoneData.push(allData[i]);
                }
            }
            pagination(zoneData, 1);
            break
        default:
            pagination(allData, 1);
            break
    }
}
//點擊熱門區域時
function clickHotZone(e) {
    e.preventDefault();
    zoneData.length = 0;
    zoneTitle.textContent = e.target.value;
    //點選 A 元素才會執行動作
    if (e.target.nodeName !== 'A') { return }
    switch (true) {
        case e.target.textContent !== '全部地區':
            for (let i = 0; i < allData.length; i++) {
                if (e.target.textContent === allData[i].Zone) {
                    zoneData.push(allData[i]);
                }
            }
            pagination(zoneData, 1);
            break
        default:
            pagination(allData, 1);
            break
    }

}

//處理當前頁面顯示的data
function pagination(importData, displayPage) {
    //目前這區總共有幾筆資料
    const totalData = importData.length;
    //每頁只會有6筆資料
    const eachPageData = 6;
    //這個地區的資料最多需要幾頁
    const totalPage = Math.ceil(totalData / eachPageData);
    let currentPage = displayPage;
    if (currentPage > totalPage) {
        currentPage = totalPage;
    }
    // 計算 "當前頁顯示筆數"，"起始點" 與 "結束點"
    const minNumber = currentPage * eachPageData - eachPageData + 1;
    const maxNumber = currentPage * eachPageData;

    //當前頁的資料
    //當number代表importData中的每一筆資料，當number在minNumber~maxNumber之間時
    //表示這個範圍(可能是第7筆～第12筆)的資料要在這個頁面顯示出來
    const pageData = [];
    importData.forEach((element, index) => {
        const number = index + 1;
        if (number >= minNumber && number <= maxNumber) {
            pageData.push(element);
        }
    });
    const pagaManager = {
        totalPage, //這個區域的資料總共需要幾頁
        currentPage, //當前頁
        pre: currentPage - 1,
        next: currentPage + 1
    }
    pageBtn(pagaManager);
    dataHtml(pageData);
}

//View
//處理一頁當中資料的呈現方式
function dataHtml(parameter) {
    let str = "";
    // console.log(parameter);
    for (let i = 0; i < parameter.length; i++) {
        str += `
            <div class="dataBlock col-xl-4 col-lg-4 col-md-4 col-sm-6 col-12">
                <div class="cardBlock">
                    <div class="image">
                        <img src="${parameter[i].Picture1}" alt="">
                    </div>
                    <div class="text">
                        <h5>${parameter[i].Name}</h5>
                        <h6>${parameter[i].Zone}</h6>
                        <h6>時間：${parameter[i].Opentime}</h6>
                        <h6>地址：${parameter[i].Add}</h6>
                    </div>
                </div>
            </div>
        `;
    }
    dataBlock.innerHTML = str;
}
//view
//處理下方切頁按鈕
function pageBtn(parameter) {
    const totalPage = parameter.totalPage;
    let str = '';
    //str是累加的，所以要先寫previous，再用迴圈跑頁數
    if (parameter.pre) {
        //<prev 要設定data-pages是為了要和點擊各頁面有一樣的效果
        str += `
        <li class="page-item">
            <a class="page-link" href="#" data-pages="${Number(parameter.currentPage)-1}">
              previous
            </a>
        </li>
        `;
    } else {
        str += `
        <li class="page-item disabled">
            <a class="page-link" href="#">
            < prev
            </a>
        </li>
        `
    }
    //顯示出此區域所需的總頁數
    for (let i = 1; i <= totalPage; i++) {
        let width = 960;
        //是當前頁面時，li會加上active
        if (document.body.clientWidth > width) {
            if (Number(parameter.currentPage) === i) {
                str += `
                <li class="page-item active">
                    <a class="page-link" href="#" data-pages="${i}">${i}</a>
                </li>
                `;
            } else {
                str += `
                <li class="page-item">
                    <a class="page-link" href="#" data-pages="${i}">${i}</a>
                </li>
                `;
            }
        }

    }
    //
    if (parameter.next) {
        // 當發生 true 的時候，為正常狀態可以點擊呈現藍色狀態
        // ${Number(parameter.currentPage) + 1} 
        // 意思是 "當前頁碼 + 1" 點擊後，以這個數值為參數導入 pagination 函式
        // 則分頁資料庫 pageData 就會改變，索引值就會來到下一頁
        str += `
		<li class="page-item"> 
			<a class="page-link" href="#" data-pages="${Number(parameter.currentPage) + 1}">
				next >
			</a>
		</li>
		`;
    } else {
        // 當發生 false 的時候，加上 disabled Class 不能點擊呈現灰色狀態
        str += `
		<li class="page-item disabled">
			<a class="page-link" href="#">
				next >
			</a>
		</li>
		`;
    }
    page.innerHTML = str;
}
//控制換頁點擊
function clickPage(e) {
    e.preventDefault();
    if (e.target.nodeName !== "A") { return }
    //取得點擊的頁數是哪一頁
    const page = e.target.dataset.pages;
    switch (true) {
        case zoneTitle.textContent !== "全部地區":
            pagination(zoneData, page);
            break
        default:
            pagination(allData, page);
            break

    }
}