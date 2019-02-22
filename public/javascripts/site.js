/*eslint --no-ignore */
;(function($, io) {
  'use strict'
  $(document).ready(function() {
    var socket = io('http://demo.teleapps.net:4000')
    // var socket = io('http://localhost:4000')
    socket.on('connect', function() {
      console.log('socket.io is connected!!!')
    })
    // left sidebar nav
    $('.accordion').accordion({
      selector: {
        trigger: '.title .icon'
      }
    })
    // user table sortable
    $('table').tablesort()
    // edit user/update password
    $('.menu .item').tab()
    // navbar dropdown
    $('.ui.dropdown').dropdown()
    // show radio buttons
    $('.ui.radio.checkbox').checkbox()
    // error/success dialog
    $('.message .close').on('click', function() {
      $(this)
        .closest('.message')
        .transition('fade')
    })
    // delete user modal handler
    $('form.run_task').submit(function(event) {
      event.preventDefault()
      var messageBox = $('#messageBox')
      $('.ui.modal.run_now')
        .modal({
          onHide: function() {
            // when close modal, if there are some testing message left from last test, then reload for next testing
            var messageContent = messageBox.text()
            if (messageContent) {
              location.reload()
            }
          },
          onDeny: function() {},
          onApprove: function() {
            var taskId = event.target.name
            var taskLiveMessage = ''

            socket.on('testProcessReport', function(data) {
              taskLiveMessage += data + '<br />'
              messageBox.html(taskLiveMessage)
            })

            $.post('/tasks/run/' + taskId, {}, function(data, status) {
              var submitBtn = $('#run_now_btn')
              var cancelBtn = $('#run_cancel_btn')
              submitBtn.attr('disabled', 'disabled')
              cancelBtn.attr('disabled', 'disabled')
            })

            return false
          }
        })
        .modal('show')
    })
    // delete user modal handler
    $('form.delete_user').submit(function(event) {
      event.preventDefault()
      $('.ui.basic.modal')
        .modal({
          onDeny: function() {},
          onApprove: function() {
            var userId = event.target.name
            $.post('/users/delete', { userId: userId }, function(data, status) {
              if (status === 'success') {
                location.reload()
              }
            })
          }
        })
        .modal('show')
    })
    // delete device modal handler
    $('form.delete_device').submit(function(event) {
      event.preventDefault()
      $('.ui.basic.modal')
        .modal({
          onDeny: function() {},
          onApprove: function() {
            var deviceId = event.target.name
            if (deviceId) {
              $.post(
                '/devices/delete_device/' + deviceId,
                { deviceId: deviceId },
                function(data, status) {
                  if (status === 'success') {
                    location.reload()
                  }
                }
              )
            }
          }
        })
        .modal('show')
    })

    // delete task modal handler
    $('form.delete_task').submit(function(event) {
      event.preventDefault()
      $('.ui.basic.modal')
        .modal({
          onDeny: function() {},
          onApprove: function() {
            var taskId = event.target.name
            if (taskId) {
              $.post('/tasks/delete/' + taskId, {}, function(data, status) {
                if (status === 'success') {
                  location.reload()
                }
              })
            }
          }
        })
        .modal('show')
    })
  })

  // show datepickers on create task page
  $('#task_start_date_picker').calendar({
    type: 'date'
  })
  $('#task_end_date_picker').calendar({
    type: 'date'
  })
  $('#run_at_time_picker').calendar({
    ampm: false,
    type: 'time'
  })

  // for create/edit task page, show/hide once-off task container and recurring task container
  $('.isTaskRecurringField').click(function() {
    var selectedTaskPlan = $(this)
      .find('input[type="radio"]')
      .val()
    if (selectedTaskPlan === 'true') {
      $('#once_off_task_container').show()
      $('#recurring_task_container').hide()
    } else if (selectedTaskPlan === 'false') {
      $('#once_off_task_container').hide()
      $('#recurring_task_container').show()
    }
  })

  $('#controlled').hide()
  $('#uncontrolled').hide()
  $('#error_msg_container').hide()
  $('#success_msg_container').hide()
  $('#msg_loader').hide()

  // handle click event on add device page
  $('.ui.radio.checkbox').click(function() {
    $('#error_msg_container').hide()
    $('#success_msg_container').hide()
    var isDeviceApiControlled = $(this)
      .children(['input[type="radio"]:checked'])
      .val()
    if (isDeviceApiControlled === 'controlled') {
      $('#controlled').show()
      $('#uncontrolled').hide()
      $('#testDeviceBtn').show()
      $('#saveDeviceBtn').attr('disabled', 'disabled')
      $('#testDeviceBtn').click(function() {
        testDeviceStatus('#saveDeviceBtn')
      })

      $('#saveDeviceBtn').click(function(e) {
        e.preventDefault()
        saveControlledDeviceDetails('add', '#createDeviceForm')
      })
    } else if (isDeviceApiControlled === 'uncontrolled') {
      $('#deviceTypeContainer').hide()
      $('#controlled').hide()
      $('#uncontrolled').show()
      $('#testDeviceBtn').hide()
      $('#saveDeviceBtn').removeAttr('disabled')

      $('#saveDeviceBtn').click(function(e) {
        e.preventDefault()
        saveUncontrolledDeviceDetails('add', '#createDeviceForm')
      })
    }
  })

  //edit device page
  $('#saveEditDeviceBtn').attr('disabled', 'disabled')
  $('#testEditDeviceBtn').click(function() {
    testDeviceStatus('#saveEditDeviceBtn')
  })
  $('#saveEditDeviceBtn').click(function(e) {
    e.preventDefault()
    saveControlledDeviceDetails('edit', '#editDeviceForm')
  })

  $('.deviceTestStatusButton').click(function(e) {
    e.preventDefault()
    var deviceProtocol = $(this)
      .siblings('input[name*="deviceProtocol"]')
      .val()
    var deviceIPAddress = $(this)
      .siblings('input[name*="deviceIPAddress"]')
      .val()
    var devicePortNumber = $(this)
      .siblings('input[name*="devicePortNumber"]')
      .val()
    var deviceUsername = $(this)
      .siblings('input[name*="deviceUsername"]')
      .val()
    var devicePassword = $(this)
      .siblings('input[name*="devicePassword"]')
      .val()
    var deviceName = $(this)
      .siblings('input[name*="deviceName"]')
      .val()

    var targetId = '#status_div_' + deviceName
    $(targetId).addClass('ui yellow ribbon label')
    $(targetId).text('Checking ...')
    var data = {
      deviceProtocol: deviceProtocol,
      deviceIPAddress: deviceIPAddress,
      devicePortNumber: devicePortNumber,
      deviceUsername: deviceUsername,
      devicePassword: devicePassword
    }

    $.post('/devices/check_status', data, function(response) {
      if (response) {
        $(targetId)
          .removeClass('yellow')
          .addClass('green')
          .text('OK')
      } else {
        $(targetId)
          .removeClass('yellow')
          .addClass('red')
          .text('Offline')
      }
    })
  })

  $('#saveEditDeviceUncontrolledBtn').click(function(e) {
    e.preventDefault()
    saveUncontrolledDeviceDetails('edit', '#editDeviceFormUncontrolled')
  })

  // generate sidebar
  var showAdminComponents = localStorage.getItem('showAdminComponents')
  var showWebexComponents = localStorage.getItem('showWebexComponents')
  var showPurecloudComponents = localStorage.getItem('showPurecloudComponents')

  showAdminComponents = showAdminComponents === 'true'
  showWebexComponents = showWebexComponents === 'true'
  showPurecloudComponents = showPurecloudComponents === 'true'

  if (!showAdminComponents) $('#admin_menu').hide()
  else $('#admin_menu').show()

  if (!showWebexComponents) $('#webex_menu').hide()
  else $('#webex_menu').show()

  if (!showPurecloudComponents) $('#pourcloud_menu').hide()
  else $('#pourcloud_menu').show()

  //utils
  function saveControlledDeviceDetails(action, formName) {
    var errors = []
    var deviceId = $('#deviceId').val() || ''
    var deviceName = $('#deviceName').val()
    var deviceType = $('#deviceType').val()
    var deviceProtocol = $('input[name="deviceProtocol"]:checked').val()
    var deviceIPAddress = $('#deviceIPAddress').val()
    var devicePortNumber = $('#devicePortNumber').val()
    var deviceExtNo = $('#deviceExtNo').val()
    var deviceUsername = $('#deviceUsername').val()
    var devicePassword = $('#devicePassword').val()

    if (!deviceName) {
      errors.push('Device Name is required')
    }
    if (!deviceType) {
      errors.push('Device Type is required')
    }
    if (!deviceExtNo) {
      errors.push('Device Extension Number is required')
    }
    if (!deviceProtocol) {
      errors.push('Device Protocol is required')
    }
    if (!devicePortNumber) {
      errors.push('Device Port Number is required')
    }
    if (!deviceIPAddress) {
      errors.push('Device IP Address is required')
    }
    if (!deviceUsername) {
      errors.push('Device Username is required')
    }
    if (!devicePassword) {
      errors.push('Device Password is required')
    }

    if (errors.length === 0) {
      checkDeviceNameUniqueness(
        deviceId,
        deviceName,
        action,
        function(response) {
          if (response) {
            $('#error_msg').text(
              'This Device Name is taken. Please choose another name.'
            )
            $('#error_msg_container').show()
            $('#success_msg_container').hide()
          } else {
            $(formName).submit()
          }
        }
      )
    } else {
      $('#error_msg').text(errors.join(' . '))
      $('#error_msg_container').show()
      $('#success_msg_container').hide()
      $('#msg_loader').hide()
    }
  }

  function saveUncontrolledDeviceDetails(action, formName) {
    var errors = []
    var deviceId = $('#deviceId').val() || ''
    var deviceName = $('#deviceName').val()
    var deviceNumberAddr = $('#deviceNumberAddr').val()

    if (!deviceName) {
      errors.push('Device Name is required')
    }
    if (!deviceNumberAddr) {
      errors.push('Device Number or Address is required')
    }
    if (errors.length === 0) {
      checkDeviceNameUniqueness(
        deviceId,
        deviceName,
        action,
        function(response) {
          if (response) {
            $('#error_msg').text(
              'This Device Name is taken. Please choose another name.'
            )
            $('#error_msg_container').show()
            $('#success_msg_container').hide()
          } else {
            $('#deviceType').val('')
            $(formName).submit()
          }
        }
      )
    } else {
      $('#error_msg').text(errors.join(' . '))
      $('#error_msg_container').show()
      $('#success_msg_container').hide()
      $('#msg_loader').hide()
    }
  }

  function testDeviceStatus(saveButtonSelector) {
    var errors = []
    $('#msg_loader').show()
    $('#error_msg_container').hide()
    $('#success_msg_container').hide()
    var deviceName = $('#deviceName').val()
    var deviceProtocol = $('input[name="deviceProtocol"]:checked').val()
    var deviceIPAddress = $('#deviceIPAddress').val()
    var devicePortNumber = $('#devicePortNumber').val()
    var deviceUsername = $('#deviceUsername').val()
    var devicePassword = $('#devicePassword').val()

    if (!deviceName) {
      errors.push('Device Unique Name is required')
    }
    if (!deviceProtocol) {
      errors.push('Device Protocol is required')
    }
    if (!deviceIPAddress) {
      errors.push('Device Endpoint IP Address is required')
    }
    if (!devicePortNumber) {
      errors.push('Device Port Number is required')
    }
    if (!deviceUsername) {
      errors.push('Device Username is required')
    }
    if (!devicePassword) {
      errors.push('Device Password is required')
    }

    if (errors.length === 0) {
      $('#error_msg_container').hide()
      var data = {
        deviceProtocol: deviceProtocol,
        deviceIPAddress: deviceIPAddress,
        devicePortNumber: devicePortNumber,
        deviceUsername: deviceUsername,
        devicePassword: devicePassword
      }
      $.post('/devices/check_status', data, function(response) {
        $('#msg_loader').hide()
        var productId = response.productId
        var uri = response.uri
        var status = response.status
        if (status) {
          $('#deviceType').val(productId)
          $('#deviceExtNo').val(uri)

          $('#success_msg').text('Test Passed.')
          $('#success_msg_container').show()
          $('#error_msg_container').hide()
          $(saveButtonSelector).removeAttr('disabled')
        } else {
          $('#error_msg').text('Test Failed.')
          $('#error_msg_container').show()
          $('#success_msg_container').hide()
          $(saveButtonSelector).attr('disabled', 'disabled')
        }
      })
    } else {
      $('#error_msg').text(errors.join(' . '))
      $('#error_msg_container').show()
      $('#success_msg_container').hide()
      $('#msg_loader').hide()
    }
  }
  function checkDeviceNameUniqueness(
    deviceId,
    deviceName,
    action,
    cb
  ) {
    $.post(
      '/devices/check_uniqueness',
      {
        deviceId: deviceId,
        deviceName: deviceName,
        action: action
      },
      cb
    )
  }
})(jQuery, io)
