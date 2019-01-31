/*eslint --no-ignore */
;(function($) {
  'use strict'
  $(document).ready(function() {
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
    // error/success dialog
    $('.message .close').on('click', function() {
      $(this)
        .closest('.message')
        .transition('fade')
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

    // show radio buttons
    $('.ui.radio.checkbox').checkbox()

    // delete device modal handler
    $('form.delete_device').submit(function(event) {
      event.preventDefault()
      $('.ui.basic.modal')
        .modal({
          onDeny: function() {},
          onApprove: function() {
            var deviceName = event.target.name
            if (deviceName) {
              $.post(
                '/settings/delete_device/' + deviceName,
                { deviceName: deviceName },
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
  })

  $('#once_off_datepicker_container').hide()
  $('#recurring_task_datepicker_container').hide()

  $('#taskRepentance').change(function() {
    var selectedValue = $(this).val()
    if (selectedValue === 'once_off') {
      $('#once_off_datepicker_container').show()
      $('#recurring_task_datepicker_container').hide()
    } else if (selectedValue === 'recurring_job') {
      $('#once_off_datepicker_container').hide()
      $('#recurring_task_datepicker_container').show()
    }
  })

  // show datepickers on add device page
  $('#once_off_datepicker').calendar()
  $('#recurring_task_start_datepicker').calendar()
  $('#recurring_task_end_datepicker').calendar()

  $('#controlled').hide()
  $('#uncontrolled').hide()
  $('#error_msg_container').hide()
  $('#success_msg_container').hide()

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
        saveDeviceDetails('add', '#createDeviceForm')
      })
    } else if (isDeviceApiControlled === 'uncontrolled') {
      $('#deviceTypeContainer').hide()
      $('#controlled').hide()
      $('#uncontrolled').show()
      $('#testDeviceBtn').hide()
      $('#saveDeviceBtn').removeAttr('disabled')

      $('#saveDeviceBtn').click(function(e) {
        e.preventDefault()
        var errors = []
        var deviceName = $('#deviceName').val()
        var deviceNumberAddr = $('#deviceNumberAddr').val()

        if (!deviceName) {
          errors.push('Device Name is required')
        }
        if (!deviceNumberAddr) {
          errors.push('Device Number or Address is required')
        }
        if (errors.length === 0) {
          checkDeviceNameUniqueness(deviceName, function(response) {
            if (response) {
              $('#error_msg').text(
                'This Device Name is taken. Please choose another name.'
              )
              $('#error_msg_container').show()
              $('#success_msg_container').hide()
            } else {
              $('#deviceType').val('')
              $('#createDeviceForm').submit()
            }
          })
        } else {
          $('#error_msg').text(errors.join(' . '))
          $('#error_msg_container').show()
          $('#success_msg_container').hide()
        }
      })
    }
  })

  //edit page
  $('#saveEditDeviceBtn').attr('disabled', 'disabled')
  $('#testEditDeviceBtn').click(function() {
    testDeviceStatus('#saveEditDeviceBtn')
  })
  $('#saveEditDeviceBtn').click(function(e) {
    e.preventDefault()
    saveDeviceDetails('edit', '#editDeviceForm')
  })

  $('.deviceTestStatusButton').click(function(e) {
    e.preventDefault()
    var deviceUrl = $(this)
      .siblings('input[name*="deviceUrl"]')
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

    $.post(
      '/settings/check_status',
      {
        deviceUrl: deviceUrl,
        deviceUsername: deviceUsername,
        devicePassword: devicePassword
      },
      function(response) {
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
      }
    )
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
  function saveDeviceDetails(action, formName) {
    var errors = []
    var deviceName = $('#deviceName').val()
    var deviceUrl = $('#deviceUrl').val()
    var deviceExtNo = $('#deviceExtNo').val()
    var deviceUsername = $('#deviceUsername').val()
    var devicePassword = $('#devicePassword').val()
    var oldName = $('#deviceOldName')
    var oldNameVal = oldName ? oldName.val() : ''

    if (!deviceName) {
      errors.push('Device Name is required')
    }
    if (!deviceExtNo) {
      errors.push('Device Extension Number is required')
    }
    if (!deviceUrl) {
      errors.push('Device Endpoint Url is required')
    }
    if (!deviceUsername) {
      errors.push('Device Username is required')
    }
    if (!devicePassword) {
      errors.push('Device Password is required')
    }

    if (errors.length === 0) {
      checkDeviceNameUniqueness(deviceName, oldNameVal, action, function(
        response
      ) {
        if (response) {
          $('#error_msg').text(
            'This Device Name is taken. Please choose another name.'
          )
          $('#error_msg_container').show()
          $('#success_msg_container').hide()
        } else {
          $(formName).submit()
        }
      })
    } else {
      $('#error_msg').text(errors.join(' . '))
      $('#error_msg_container').show()
      $('#success_msg_container').hide()
    }
  }

  function testDeviceStatus(saveButtonSelector) {
    var errors = []
    var deviceName = $('#deviceName').val()
    var deviceUrl = $('#deviceUrl').val()
    var deviceExtNo = $('#deviceExtNo').val()
    var deviceUsername = $('#deviceUsername').val()
    var devicePassword = $('#devicePassword').val()

    if (!deviceName) {
      errors.push('Device Unique Name is required')
    }
    if (!deviceUrl) {
      errors.push('Device Endpoint Url is required')
    }
    if (!deviceExtNo) {
      errors.push('Device Extension Number is required')
    }
    if (!deviceUsername) {
      errors.push('Device Username is required')
    }
    if (!devicePassword) {
      errors.push('Device Password is required')
    }

    if (errors.length === 0) {
      $('#error_msg_container').hide()
      $.post(
        '/settings/check_status',
        {
          deviceUrl: deviceUrl,
          deviceUsername: deviceUsername,
          devicePassword: devicePassword
        },
        function(response) {
          if (response) {
            $('#success_msg').text('Test Passed.')
            $('#success_msg_container').show()
            $('#error_msg_container').hide()
            $(saveButtonSelector).removeAttr('disabled')
          } else {
            $('#error_msg').text('Test Failed.')
            $('#error_msg_container').show()
            $('#success_msg_container').hide()
          }
        }
      )
    } else {
      $('#error_msg').text(errors.join(' . '))
      $('#error_msg_container').show()
      $('#success_msg_container').hide()
    }
  }
  function checkDeviceNameUniqueness(deviceName, oldName, action, cb) {
    $.post(
      '/settings/check_uniqueness',
      { deviceName: deviceName, oldName: oldName, action: action },
      cb
    )
  }
})(jQuery)
