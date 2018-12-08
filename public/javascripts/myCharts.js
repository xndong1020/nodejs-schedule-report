(function(data) {
  // data preparation
  var jitterIncomingArray = data.map(item =>
    parseFloat(item.VoiceIncomingMaxJitter)
  );
  var jitterOutgoingArray = data.map(item =>
    parseFloat(item.VoiceOutgoingMaxJitter)
  );
  var incomingPacketLosePercentArray = data.map(item =>
    parseFloat(item.VoiceIncomingPacketLosePercent)
  );
  var outgoingPacketLosePercentArray = data.map(item =>
    parseFloat(item.VoiceOutgoingPacketLosePercent)
  );
  var successfulCallArray = data.filter(item => item.status === "OK");
  var callSuccesfulRateArray = [
    successfulCallArray.length,
    data.length - successfulCallArray.length
  ];

  var callIdLabels = data.map(item => parseFloat(item.callId));

  // call successful rate
  var ctx = document.getElementById("callSuccessRateChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["OK", "Failed"],
      datasets: [
        {
          label: "# of calls",
          data: callSuccesfulRateArray,
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

  // incomingPacketLoseChart
  var ctx1 = document
    .getElementById("incomingPacketLoseChart")
    .getContext("2d");
  new Chart(ctx1, {
    type: "line",
    data: {
      labels: callIdLabels,
      datasets: [
        {
          label: "Percentage",
          data: incomingPacketLosePercentArray,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });

  // outgoingPacketLoseChart
  var ctx2 = document
    .getElementById("outgoingPacketLoseChart")
    .getContext("2d");
  new Chart(ctx2, {
    type: "line",
    data: {
      labels: callIdLabels,
      datasets: [
        {
          label: "Percentage",
          data: outgoingPacketLosePercentArray,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255,1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });

  // incomingJitterChart
  var ctx3 = document.getElementById("incomingJitterChart").getContext("2d");
  new Chart(ctx3, {
    type: "line",
    data: {
      labels: callIdLabels,
      datasets: [
        {
          label: "Percentage",
          data: jitterIncomingArray,
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });

  // incomingJitterChart
  var ctx4 = document.getElementById("outgoingJitterChart").getContext("2d");
  new Chart(ctx4, {
    type: "line",
    data: {
      labels: callIdLabels,
      datasets: [
        {
          label: "Percentage",
          data: jitterOutgoingArray,
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
})(data);
