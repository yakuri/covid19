// グラフデータ
var chartData;
// グラフ
var chart;

/*
 * 初期表示
 */
$(function(){
  // 感染数・死者数のデータ
  var prefectures = getPrefectures();

  // 感染数（死者数含む）の一覧表示
  displayList(prefectures);
});

/*
 * 合計のデータを取得
 */
function getTotalHistory() {
  // 感染数・死者数のデータを初期化
  var totalHistory = [];
  // 合計のデータを取得
  $.ajax({
    url:"https://covid19-japan-web-api.now.sh/api/v1/total?history=true",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      totalHistory = data;
      for(var i in data){
        if(i==0) {
          // 感染数
          totalHistory[i].positiveDaily = data[i].positive;
          // 死者数
          totalHistory[i].deathDaily = data[i].death;
        } else {
          // 感染数
          totalHistory[i].positiveDaily = data[i].positive - data[i-1].positive;
          // 死者数
          totalHistory[i].deathDaily = data[i].death - data[i-1].death;
        }
        // 死者数の割合
        totalHistory[i].percent = getPercent(data[i].positive, data[i].death);
      }
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });
  return totalHistory;
}

/*
 * 感染数・死者数のデータを取得
 */
function getPrefectures() {
  // 感染数・死者数のデータを初期化
  var prefectures = [];
  prefectures.data = [];
  for (let i = 0; i < 47; i++) {
    // 日付
    prefectures.date = [];
    // 感染数・死者数のデータ
    prefectures.data[i] = [];
    // 感染数
    prefectures.data[i].cases = [];
    // 死者数
    prefectures.data[i].deaths = [];
    // 10万人あたりの死者数
    prefectures.data[i].deathsPer100000 = [];
  }

  // 現在のデータを取得
  $.ajax({
    url:"https://covid19-japan-web-api.now.sh/api/v1/prefectures",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      // 日時
      prefectures.date[0] = new Date();
      for(var i in data){
        // ID
        prefectures.data[i].id = data[i].id;
        // 都道府県
        prefectures.data[i].name_ja = data[i].name_ja;
        // 感染数(現在)
        prefectures.data[i].cases[0] = data[i].cases;
        // 死者数(現在)
        prefectures.data[i].deaths[0] = data[i].deaths;
        // 10万人あたりの死者数(現在)
        prefectures.data[i].deathsPer100000[0] = prefectures.data[i].deaths[0] * 100 / populationList[i];
      }
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  // 前日のデータを取得
  var yesterDayStr = getDayDateStr(-1);
  $.ajax({
    url:"https://yakuri.github.io/covid19/data/prefectures_" + yesterDayStr + ".json",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      // 日時
      prefectures.date[1] = new Date(Date.parse(data.date));
      for(var i in data.data){
        // 感染数(前日)
        prefectures.data[i].cases[1] = data.data[i].cases;
        // 死者数(前日)
        prefectures.data[i].deaths[1] = data.data[i].deaths;
        // 10万人あたりの死者数(前日)
        prefectures.data[i].deathsPer100000[1] = prefectures.data[i].deaths[1] * 100 / populationList[i];
      }
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  return prefectures;
}

/*
 * 感染数・死者数の一覧を表示
 */
function displayList(prefectures) {
  var data = prefectures.data;
  // 現在の感染数でソート
  data.sort(function(a,b){
    if(a.cases[0] > b.cases[0]) return -1;
    if(a.cases[0] < b.cases[0]) return 1;
    return 0;
  });
  // 感染数(現在)の合計
  var totalCases = 0;
  // 感染数(前日)の合計
  var totalCasesYesterDay = 0;
  // 死者数(現在)の合計
  var totalDeaths = 0;
  // 死者数(前日)の合計
  var totalDeathsYesterDay = 0;
  // 人口の合計
  var totalPopulation = 0;

  // ヘッダを出力
  $("#output").append("<tr>"
    + "<th>都道府県</th>"
    + "<th>感染数(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>死者数(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>死者数の割合(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>10万人あたりの死者数(前日比<span class=notice2>(※)</span>)</th>"
    + "</tr>");

  // 感染数（死者数含む）の一覧表示
  for(var i in data){
    // 死者数の割合(現在)
    var percent = getPercent(data[i].cases[0], data[i].deaths[0]);
    // 死者数の割合(前日)
    var percentYesterDay = getPercent(data[i].cases[1], data[i].deaths[1]);

    // 都道府県毎のデータの行を出力
    $("#output").append("<tr>"
      + "<td>"
      + data[i].name_ja
      + "</td>"
      + "<td>"
      + data[i].cases[0] + "名"
      + "(" + getDiffIntValue(data[i].cases[0], data[i].cases[1]) + ")"
      + "</td>"
      + "<td>"
      + data[i].deaths[0] + "名"
      + "(" + getDiffIntValue(data[i].deaths[0], data[i].deaths[1]) + ")"
      + "</td>"
      + "<td>"
      + percent + "%"
      + "(" + getDiffDecimalValue(percent, percentYesterDay, 1) + ")"
      + "</td>"
      + "<td>"
      + round(data[i].deathsPer100000[0], 2) + "名"
      + "(" + getDiffDecimalValue(data[i].deathsPer100000[0], data[i].deathsPer100000[1], 2) + ")"
      + "</td>"
      + "</tr>");

      totalCases = totalCases + data[i].cases[0];
      totalDeaths = totalDeaths + data[i].deaths[0];
      totalCasesYesterDay = totalCasesYesterDay + data[i].cases[1];
      totalDeathsYesterDay = totalDeathsYesterDay + data[i].deaths[1];
      totalPopulation = totalPopulation + populationList[data[i].id - 1];
  }

  // 死者数の割合(合計,現在)
  var percentTotal = getPercent(totalCases, totalDeaths);
  // 死者数の割合(合計,前日)
  var percentTotalYesterDay = getPercent(totalCasesYesterDay, totalDeathsYesterDay);
  // 10万人あたりの死者数(合計,現在)
  var deathsPer100000Total = round(totalDeaths * 100 / totalPopulation, 2);
  // 10万人あたりの死者数(合計,前日)
  var deathsPer100000TotalYesterDay = round(totalDeathsYesterDay * 100 / totalPopulation, 2);
  // 合計のデータの行を出力
  $("#output").append("<tr>"
    + "<td>計</td>"
    + "<td>" + totalCases + "名"
    + "(" + getDiffIntValue(totalCases, totalCasesYesterDay) + ")"
    + "</td>"
    + "<td>" + totalDeaths + "名"
    + "(" + getDiffIntValue(totalDeaths, totalDeathsYesterDay) + ")"
    + "</td>"
    + "<td>" + percentTotal + "%"
    + "(" + getDiffDecimalValue(percentTotal, percentTotalYesterDay, 1) + ")"
    + "</td>"
    + "<td>" + deathsPer100000Total + "名"
    + "(" + getDiffDecimalValue(deathsPer100000Total, deathsPer100000TotalYesterDay, 2) + ")"
    + "</td>"
    + "</tr>");

  $("#baseDate").append(getBaseDateStr(prefectures.date[1]));
}

/*
 * グラフを表示する
 */
function displayChart() {
  obj = document.form.chart;
  index = obj.selectedIndex;
  const chartNotice = document.getElementById("chartNotice");
  chartNotice.style.display ="none";
  if (index == 0) {
    // 「表示するグラフを選択してください」を選択した場合
    if(chart) {
      // 表示中のグラフを削除する
      chart.destroy();
    }
  } else {
    // 感染数・死者数のデータを取得
    var data;
    switch (obj.options[index].value) {
      case 'chartCasesTop10':
        // 都道府県別 感染数（TOP10）のグラフを表示
        data = getPrefectures();
        displayChartCases(data);
        break;
      case 'chartDeathsTop10':
        // 都道府県別 死者数（TOP10）のグラフを表示
        data = getPrefectures();
        displayChartDeaths(data);
        break;
      case 'chartCasesHistory':
        // 感染数の推移のグラフを表示
        data = getTotalHistory();
        displayChartCasesHistory(data);
        chartNotice.style.display ="block";
        break;
      case 'chartDeathsHistory':
        // 死者数の推移のグラフを表示
        data = getTotalHistory();
        displayChartDeathsHistory(data);
        chartNotice.style.display ="block";
        break;
      case 'chartPercentHistory':
        // 感染数に占める死者数の割合の推移のグラフを表示
        data = getTotalHistory();
        displayChartPercentHistory(data);
        chartNotice.style.display ="block";
        break;
      default:
    }
  }
}

/*
 * 都道府県別 感染数（TOP10）のグラフを表示
 */
function displayChartCases(prefectures) {
  // グラフデータの初期化
  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        label: '感染数',
        data: [{}],
        backgroundColor: "rgba(219,39,91,0.5)",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '都道府県別 感染数（TOP10）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          },
      },]
    },
  };
  // 現在の感染数でソート
  prefectures.data.sort(function(a,b){
    if(a.cases[0] > b.cases[0]) return -1;
    if(a.cases[0] < b.cases[0]) return 1;
    return 0;
  });
  // グラフデータを設定
  for(var i in prefectures.data){
    if (i < 10) {
      chartData.data.labels[i] = prefectures.data[i].name_ja;
      chartData.data.datasets[0].data[i] = prefectures.data[i].cases[0];
    }
  }
  // グラフを表示
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}

/*
 * 都道府県別 死者数（TOP10）のグラフを表示
 */
function displayChartDeaths(prefectures) {
  // 死者数のグラフデータの初期化
  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        label: '死者数',
        data: [{}],
        backgroundColor: "rgba(100,39,91,0.5)",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '都道府県別 死者数（TOP10）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          },
      },]
    },
  };
  // 現在の死者数でソート
  prefectures.data.sort(function(a,b){
    if(a.deaths[0] > b.deaths[0]) return -1;
    if(a.deaths[0] < b.deaths[0]) return 1;
    return 0;
  });
  // 取得したデータを死者数のグラフデータに設定
  for(var i in prefectures.data){
    // グラフ表示用
    if (i < 10) {
        chartData.data.labels[i] = prefectures.data[i].name_ja;
        chartData.data.datasets[0].data[i] = prefectures.data[i].deaths[0];
    }
  }
  // グラフを表示
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}

/*
 * 全国 感染数の推移のグラフを表示
 */
function displayChartCasesHistory(totalHistory) {
  // グラフデータの初期化
  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        type: 'line',
        label: '感染数(累計)(※)',
        data: [{}],
        backgroundColor: "rgba(0,100,0,0.5)",
        fill: false,
        yAxisID: "y-axis-1",
      },
      {
        type: 'bar',
        label: '感染数(日別)(※)',
        data: [{}],
        backgroundColor: "rgba(0,0,100,0.5)",
        yAxisID: "y-axis-2",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '感染数（推移）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
        id: "y-axis-1",
        type: "linear",
        position: "left",
        ticks: {
        },
        scaleLabel: {
          display: true,
          labelString: '感染数(累計)'
        }
      },{
          id: "y-axis-2",
          type: "linear",
          position: "right",
          ticks: {
          },
          scaleLabel: {
            display: true,
            labelString: '感染数(日別)'
          },
          gridLines: {
            drawOnChartArea: false,
          },
      },]
    },
  };
  // グラフデータを設定
  for(var i in totalHistory){
    chartData.data.labels[i] = totalHistory[i].date;
    chartData.data.datasets[0].data[i] = totalHistory[i].positive;
    chartData.data.datasets[1].data[i] = totalHistory[i].positiveDaily;
  }
  // グラフを表示
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}

/*
 * 全国 死者数の推移のグラフを表示
 */
function displayChartDeathsHistory(totalHistory) {
  // グラフデータの初期化
  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        type: 'line',
        label: '死者数(累計)(※)',
        data: [{}],
        backgroundColor: "rgba(0,0,100,0.5)",
        fill: false,
        yAxisID: "y-axis-1",
      },
      {
        type: 'bar',
        label: '死者数(※)',
        data: [{}],
        backgroundColor: "rgba(0,0,30,0.5)",
        yAxisID: "y-axis-2",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '死者数（推移）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          id: "y-axis-1",
          type: "linear",
          position: "left",
          ticks: {
          }
      },{
          id: "y-axis-2",
          type: "linear",
          position: "right",
          ticks: {
          },
          gridLines: {
            drawOnChartArea: false,
          },
      },]
    },
  };
  // グラフデータを設定
  for(var i in totalHistory){
    chartData.data.labels[i] = totalHistory[i].date;
    chartData.data.datasets[0].data[i] = totalHistory[i].death;
    chartData.data.datasets[1].data[i] = totalHistory[i].deathDaily;
  }
  // グラフを表示
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}

/*
 * 感染数に占める死者数の割合（推移）のグラフを表示
 */
function displayChartPercentHistory(totalHistory) {
  // グラフデータの初期化
  chartData = {};
  chartData.type = 'line';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        label: '感染数に占める死者数の割合(%)(※)',
        data: [{}],
        backgroundColor: "rgba(19,39,91,0.5)",
        fill: false,
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '感染数に占める死者数の割合(推移)'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
        ticks: {
        },
      },]
    },
  };
  // グラフデータを設定
  for(var i in totalHistory){
    chartData.data.labels[i] = totalHistory[i].date;
    chartData.data.datasets[0].data[i] = totalHistory[i].percent;
  }
  // グラフを表示
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}

/*
 * 整数aとbの差分(a-b)を取得
 */
function getDiffIntValue(a, b) {
  // 前日からの死者数の増加数
  var diff = a - b;
  if(diff > 0) {
    diff = "+" + diff;
  }
  return diff;
}

/*
 * 小数aとbの差分(a-b)を、小数点以下の桁数n桁で取得
 */
function getDiffDecimalValue(a, b, n) {
  var diff = a - b;
  // 小数点以下の桁数n桁で設定
  diff = round(diff, n);
  if(diff > 0) {
    diff = "+" + diff;
  }
  return diff;
}

/*
 * 死者数の割合(%)を取得
 */
function getPercent(cases, deaths) {
  var percent = 0;
  if(cases != 0) {
    // 小数点以下の桁数1桁で設定
    percent = round(deaths * 100 / cases, 1);
  }
  return percent;
}

/*
 * 小数点以下の桁数n桁になるように四捨五入する
 */
function round(value, n) {
  var tmp = 1;
  for(var i = 0; i < n; i++) {
    tmp = tmp * 10;
  }
  return Math.round(value * tmp) / tmp;
}

/*
 * 日付文字列(YYYYMMDD)を取得する
 * 引数：day 本引数に指定した日数を加算・減算する
 */
function getDayDateStr(day) {
  // 日本時間を取得
  var date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  date.setDate(date.getDate() + day);

  var year = date.getFullYear();
  var month = (date.getMonth() + 1);
  var day = date.getDate();
  return year + ('0' + month).slice(-2) + ('0' + day).slice(-2);
}

/*
 * 日時の文字列(YYYYMMDDHHMM)を取得する
 */
function getBaseDateStr(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1);
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return year + '年' + month + '月' + day + '日' + hours + '時' + minutes + '分';
}
