(function(data) {
  // data preparation
  console.log('das', data);
  
  var callIdLabels = data.map(item => parseFloat(item.callId));
  var bothSuccessArray = data.filter(item => item.CallHoldStatus === 'OK' && item.CallResumeStatus === 'OK')
  var onlyHoldSuccessArray = data.filter(item => item.CallHoldStatus === 'OK' && item.CallResumeStatus !== 'OK')
  var onlyResumeSuccessArray = data.filter(item => item.CallHoldStatus !== 'OK' && item.CallResumeStatus === 'OK')

  // call successful rate
  var ctx = document.getElementById("bothSuccessChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["OK", "Failed"],
      datasets: [
        {
          label: "# of calls",
          data: [bothSuccessArray.length, data.length-bothSuccessArray.length],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)"
          ],
          borderColor: ["rgba(255,99,132,1)", "rgba(54, 162, 235, 1)"],
          borderWidth: 1
        }
      ]
    }
  });  

  // utility methods
  // generate random color
  function randomColorGenerator(alpha) {
    return (
      "rgb(" +
      Math.floor(Math.random() * 255).toString() +
      "," +
      Math.floor(Math.random() * 255).toString() +
      "," +
      Math.floor(Math.random() * 255).toString() +
      "," +
      alpha +
      ")"
    );
  }

  // generate border color based on colorArray provided
  function getBorderColor(colorArray) {
    return colorArray.map(item => item.replace(new RegExp("0.2", "g"), "1"));
  }
})(data);
