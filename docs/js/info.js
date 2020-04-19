$(function(){

  // 感染数のグラフデータの初期化
  var chartDataKansen = {};
  chartDataKansen.type = 'bar';
  chartDataKansen.data = {
    labels: [{}],
    datasets: [
      {
        label: '感染数',
        data: [{}],
        backgroundColor: "rgba(219,39,91,0.5)",
      },
    ]
  };
  chartDataKansen.options = {
    maintainAspectRatio: false,
    title: {
      display: true,
      text: '都道府県別 感染数（上位10都道府県）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          }
      },]
    },
  };

  // 死者数のグラフデータの初期化
  var chartDataShisha = {};
  chartDataShisha.type = 'bar';
  chartDataShisha.data = {
    labels: [{}],
    datasets: [
      {
        label: '死者数',
        data: [{}],
        backgroundColor: "rgba(100,39,91,0.5)",
      },
    ]
  };
  chartDataShisha.options = {
    maintainAspectRatio: false,
    title: {
      display: true,
      text: '都道府県別 死者数（上位10都道府県）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          }
      },]
    },
  };

  // 感染数・死者数のデータ
  var dataKansenShisha;

  // 現在のデータを取得
  $.ajax({
    url:"https://covid19-japan-web-api.now.sh/api/v1/prefectures",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      // 感染数(現在)
      dataKansenShisha = data;
      for(var i in data) {
        // 10万人あたりの死者数(現在)
        dataKansenShisha[i].deathsPer100000 = dataKansenShisha[i].deaths * 100 / populationList[i];
      }
      // console.log(JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  // 前日のデータを取得
  var yesterDayStr = getYesterDayDateStr();
  // 前日のデータがいつ時点のデータを元にしているか
  var baseDateStr;
  $.ajax({
    url:"https://yakuri.github.io/covid19/data/prefectures_" + yesterDayStr + ".json",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      baseDateStr = getBaseDateStr(new Date(Date.parse(data.date)));
      for(var i in data.data){
        // 感染数(前日)
        dataKansenShisha[i].casesYesterDay = data.data[i].cases;
        // 死者数(前日)
        dataKansenShisha[i].deathsYesterDay = data.data[i].deaths;
        // 10万人あたりの死者数(前日)
        dataKansenShisha[i].deathsPer100000YesterDay = dataKansenShisha[i].deathsYesterDay * 100 / populationList[i];
      }
      // console.log(JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  // 現在の感染数でソート
  dataKansenShisha.sort(function(a,b){
    if(a.cases > b.cases) return -1;
    if(a.cases < b.cases) return 1;
    return 0;
  });

  // 感染数（死者数含む）の一覧表示
  displayList(dataKansenShisha, baseDateStr);

  // 感染数のグラフデータを表示
  displayChartDataKansen(chartDataKansen, dataKansenShisha);

  // 現在の死者数でソート
  dataKansenShisha.sort(function(a,b){
    if(a.deaths > b.deaths) return -1;
    if(a.deaths < b.deaths) return 1;
    return 0;
  });

  // 死者数のグラフデータを表示
  displayChartDataShisha(chartDataShisha, dataKansenShisha);
});

// 一覧を表示
function displayList(dataKansenShisha, baseDateStr) {
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
    + "<th>都道府県名</th>"
    + "<th>感染数(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>死者数(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>死者数の割合(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>10万人あたりの死者数(前日比<span class=notice2>(※)</span>)</th>"
    + "</tr>");

  // 感染数（死者数含む）の一覧表示
  for(var i in dataKansenShisha){
    // 死者数の割合(現在)
    var percent = getPercent(dataKansenShisha[i].cases, dataKansenShisha[i].deaths);
    // 死者数の割合(前日)
    var percentYesterDay = getPercent(dataKansenShisha[i].casesYesterDay, dataKansenShisha[i].deathsYesterDay);

    // 都道府県毎のデータの行を出力
    $("#output").append("<tr>"
      + "<td>"
      + dataKansenShisha[i].name_ja
      + "</td>"
      + "<td>"
      + dataKansenShisha[i].cases + "名"
      + "(" + getDiffIntValue(dataKansenShisha[i].cases, dataKansenShisha[i].casesYesterDay) + ")"
      + "</td>"
      + "<td>"
      + dataKansenShisha[i].deaths + "名"
      + "(" + getDiffIntValue(dataKansenShisha[i].deaths, dataKansenShisha[i].deathsYesterDay) + ")"
      + "</td>"
      + "<td>"
      + percent + "%"
      + "(" + getDiffDecimalValue(percent, percentYesterDay, 1) + ")"
      + "</td>"
      + "<td>"
      + round(dataKansenShisha[i].deathsPer100000, 2) + "名"
      + "(" + getDiffDecimalValue(dataKansenShisha[i].deathsPer100000, dataKansenShisha[i].deathsPer100000YesterDay, 2) + ")"
      + "</td>"
      + "</tr>");

      totalCases = totalCases + dataKansenShisha[i].cases;
      totalDeaths = totalDeaths + dataKansenShisha[i].deaths;
      totalCasesYesterDay = totalCasesYesterDay + dataKansenShisha[i].casesYesterDay;
      totalDeathsYesterDay = totalDeathsYesterDay + dataKansenShisha[i].deathsYesterDay;
      totalPopulation = totalPopulation + populationList[dataKansenShisha[i].id - 1];
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

  $("#baseDate").append(baseDateStr);
}

// 感染数のグラフデータを表示
function displayChartDataKansen(chartDataKansen, dataKansenShisha) {
  // 感染数のグラフデータを設定
  for(var i in dataKansenShisha){
    if (i < 10) {
      chartDataKansen.data.labels[i] = dataKansenShisha[i].name_ja;
      chartDataKansen.data.datasets[0].data[i] = dataKansenShisha[i].cases;
    }
  }
  // 感染数のグラフを表示
  var ctx = document.getElementById('chartKansen');
  var chart = new Chart(ctx, chartDataKansen);
}

// 死者数のグラフデータを表示
function displayChartDataShisha(chartDataShisha, dataKansenShisha) {
  // 取得したデータを死者数のグラフデータに設定
  for(var i in dataKansenShisha){
    // グラフ表示用
    if (i < 10) {
        chartDataShisha.data.labels[i] = dataKansenShisha[i].name_ja;
        chartDataShisha.data.datasets[0].data[i] = dataKansenShisha[i].deaths;
    }
  }
  // 死者数のグラフを表示
  var ctx = document.getElementById('chartShisha');
  var chart = new Chart(ctx, chartDataShisha);
}

// 整数aとbの差分(a-b)を取得
function getDiffIntValue(a, b) {
  // 前日からの死者数の増加数
  var diff = a - b;
  if(diff > 0) {
    diff = "+" + diff;
  }
  return diff;
}

// 小数aとbの差分(a-b)を、小数点以下の桁数n桁で取得
function getDiffDecimalValue(a, b, n) {
  var diff = a - b;
  // 小数点以下の桁数n桁で設定
  diff = round(diff, n);
  if(diff > 0) {
    diff = "+" + diff;
  }
  return diff;
}

// 死者数の割合(%)を取得
function getPercent(cases, deaths) {
  var percent = 0;
  if(cases != 0) {
    // 小数点以下の桁数1桁で設定
    percent = round(deaths * 100 / cases, 1);
  }
  return percent;
}

// 小数点以下の桁数n桁になるように四捨五入する
function round(value, n) {
  var tmp = 1;
  for(var i = 0; i < n; i++) {
    tmp = tmp * 10;
  }
  return Math.round(value * tmp) / tmp;
}

// 前日の日付文字列(YYYYMMDD)を取得する
function getYesterDayDateStr() {
  // 日本時間を取得
  var date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  // 前日を取得
  date.setDate(date.getDate() - 1);

  var year = date.getFullYear();
  var month = (date.getMonth() + 1);
  var day = date.getDate();
  return year + ('0' + month).slice(-2) + ('0' + day).slice(-2);
}

// 日時の文字列(YYYYMMDDHHMM)を取得する
function getBaseDateStr(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1);
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return year + '年' + month + '月' + day + '日' + hours + '時' + minutes + '分';
}
