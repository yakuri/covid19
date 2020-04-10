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

$.ajax({
  url:"https://covid19-japan-web-api.now.sh/api/v1/prefectures",
  type:"GET",
  dataType:"json",
  timespan:1000
  }).done(function(data1,textStatus,jqXHR) {
    $("#output").append("<tr><th>都道府県名</th><th>感染数</th><th>死者数</th><th>感染数における死者数の割合</th></tr>");
    var totalcases = 0;
    var totaldeaths = 0;

    // 感染数でソート
    data1.sort(function(a,b){
      if(a.cases > b.cases) return -1;
      if(a.cases < b.cases) return 1;
      return 0;
    });
    for(var i in data1){
        var parcent = 0;
        if(data1[i].cases != 0) {
          parcent = Math.round(data1[i].deaths * 1000 / data1[i].cases) / 10;
        }
        // 一覧表示用
        $("#output").append("<tr><td>" + data1[i].name_ja
          + "</td><td>" + data1[i].cases
          + "名</td><td>" + data1[i].deaths
          + "名</td><td>" + parcent
          + "%</td></tr>");
          totalcases = totalcases + data1[i].cases;
          totaldeaths = totaldeaths + data1[i].deaths;

          // グラフ表示用
          if (i < 10) {
              chartDataKansen.data.labels[i] = data1[i].name_ja;
              chartDataKansen.data.datasets[0].data[i] = data1[i].cases;
              //chartDataKansen.data.datasets[1].data[i] = data1[i].deaths;
          }
    }
    $("#output").append("<tr><td>計</td><td>" + totalcases
      + "名</td><td>" + totaldeaths
      + "名</td><td>" + Math.round(totaldeaths * 1000 / totalcases) / 10
      + "%</td></tr>");
    var data2 = JSON.stringify(data1);

    // 死者数でソート
    data1.sort(function(a,b){
      if(a.deaths > b.deaths) return -1;
      if(a.deaths < b.deaths) return 1;
      return 0;
    });
    for(var i in data1){
      // グラフ表示用
      if (i < 10) {
          chartDataShisha.data.labels[i] = data1[i].name_ja;
          chartDataShisha.data.datasets[0].data[i] = data1[i].deaths;
      }
    }

    // グラフ表示用
    var ctx = document.getElementById('chartKansen');
    var chart = new Chart(ctx, chartDataKansen);
    ctx = document.getElementById('chartShisha');
    var chart = new Chart(ctx, chartDataShisha);

    console.log(data2);
  }).fail(function(jqXHR, textStatus, errorThrown ) {
    console.log(jqXHR.status);
    console.log(textStatus);
    console.log(errorThrown);
  }).always(function(){
    console.log("complete");
});
