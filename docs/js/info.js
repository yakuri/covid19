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
      for(var i in data){
        // 死者数の割合(現在)
        dataKansenShisha[i].percent = 0;
        if(dataKansenShisha[i].cases != 0) {
          dataKansenShisha[i].percent = Math.round(dataKansenShisha[i].deaths * 1000 / dataKansenShisha[i].cases) / 10;
        }
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
  $.ajax({
    url:"https://yakuri.github.io/covid19/data/prefectures_20200411.json",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      for(var i in data.data){
        // 感染数(前日)
        dataKansenShisha[i].casesYesterDay = data.data[i].cases;
        // 感染数(前日比)
        dataKansenShisha[i].casesDiff = dataKansenShisha[i].cases - dataKansenShisha[i].casesYesterDay ;
        // 死者数(前日)
        dataKansenShisha[i].deathsYesterDay = data.data[i].deaths;
        // 死者数(前日比)
        dataKansenShisha[i].deathsDiff = dataKansenShisha[i].deaths - dataKansenShisha[i].deathsYesterDay;
        // 死者数の割合(前日)
        dataKansenShisha[i].percentYesterDay = 0;
        if(dataKansenShisha[i].casesYesterDay != 0) {
          // 小数点以下の桁数1桁で設定
          dataKansenShisha[i].percentYesterDay = Math.round(dataKansenShisha[i].deathsYesterDay * 1000 / dataKansenShisha[i].casesYesterDay) / 10;
        }
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
  displayList(dataKansenShisha);

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
function displayList(dataKansenShisha) {
  $("#output").append("<tr><th>都道府県名</th><th>感染数(前日比)</th><th>死者数(前日比)</th><th>死者数の割合(前日比)</th></tr>");
  // 感染数(現在)の合計
  var totalCases = 0;
  // 感染数(前日)の合計
  var totalCasesYesterDay = 0;
  // 死者数(現在)の合計
  var totalDeaths = 0;
  // 死者数(前日)の合計
  var totalDeathsYesterDay = 0;

  // 感染数（死者数含む）の一覧表示
  for(var i in dataKansenShisha){
    // 前日からの死者数の割合の増加
    var percentDiff = dataKansenShisha[i].percent - dataKansenShisha[i].percentYesterDay;
    // 小数点以下の桁数1桁で設定
    percentDiff = Math.round(percentDiff * 10) / 10;
    if(percentDiff > 0) {
      percentDiff = "+" + percentDiff;
    }

    // 都道府県毎のデータの行を出力
    $("#output").append("<tr><td>"
      + dataKansenShisha[i].name_ja
      + "</td><td>"
      + dataKansenShisha[i].cases + "名"
      + "(" + getDiffIntValue(dataKansenShisha[i].cases, dataKansenShisha[i].casesYesterDay) + ")"
      + "</td><td>"
      + dataKansenShisha[i].deaths + "名"
      + "(" + getDiffIntValue(dataKansenShisha[i].deaths, dataKansenShisha[i].deathsYesterDay) + ")"
        + "</td><td>"
        + dataKansenShisha[i].percent + "%"
        + "(" + percentDiff + ")"
        + "</td></tr>");

      totalCases = totalCases + dataKansenShisha[i].cases;
      totalDeaths = totalDeaths + dataKansenShisha[i].deaths;
      totalCasesYesterDay = totalCasesYesterDay + dataKansenShisha[i].casesYesterDay;
      totalDeathsYesterDay = totalDeathsYesterDay + dataKansenShisha[i].deathsYesterDay;
  }

  // 合計のデータの行を出力
  $("#output").append("<tr><td>計</td><td>" + totalCases
    + "名"
    + "(" + getDiffIntValue(totalCases, totalCasesYesterDay) + ")"
    + "</td><td>" + totalDeaths
    + "名"
    + "(" + getDiffIntValue(totalDeaths, totalDeathsYesterDay) + ")"
    + "</td><td>" + Math.round(totalDeaths * 1000 / totalCases) / 10
    + "%</td></tr>");
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

// aとbの差分(a-b)を取得
function getDiffIntValue(a, b) {
  // 前日からの死者数の増加数
  var diff = a - b;
  if(diff > 0) {
    diff = "+" + diff;
  } else if(diff == 0) {
    // 何もしない
  } else {
    diff = "-" + diff;
  }
  return diff;
}

// 死者数の割合(%)を取得
function getPercent(cases, deaths) {
  var percent = 0;
  if(cases != 0) {
    // 小数点以下の桁数1桁で設定
    percent = Math.round(deaths * 1000 / cases) / 10;
  }
  return percent;
}
