const deviceStatusReader = statusResponseJson => {
  let result = {}
  if (statusResponseJson && statusResponseJson['Status']) {
    const statusObj = statusResponseJson['Status']

    if (statusObj && statusObj['SystemUnit']) {
      const systemUnit = statusObj['SystemUnit']

      if (
        systemUnit &&
        Array.isArray(systemUnit) &&
        systemUnit.length > 0 &&
        systemUnit[0] &&
        systemUnit[0]['ProductId'] &&
        Array.isArray(systemUnit[0]['ProductId']) &&
        systemUnit[0]['ProductId'][0]
      ) {
        result['productId'] = systemUnit[0]['ProductId'][0]
      }
    }

    if (statusObj && statusObj['SIP']) {
      const sip = statusObj['SIP']

      if (
        sip &&
        Array.isArray(sip) &&
        sip.length > 0 &&
        sip[0] &&
        sip[0]['Registration']
      ) {
        const registration = sip[0]['Registration']

        if (
          registration &&
          Array.isArray(registration) &&
          registration.length > 0 &&
          registration[0]
        ) {
          const { URI, Status } = registration[0]
          if (Array.isArray(URI)) result['uri'] = URI[0]
          if (Array.isArray(Status)) result['status'] = Status[0]
        }
      }
    }
  }

  return result
}

module.exports = {
  deviceStatusReader
}
