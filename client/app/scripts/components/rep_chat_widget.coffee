TBB.RepChatWidgetComponent = Ember.Component.extend
  didInsertElement: ->
    createdArchive = false
    params = window.location.href.split("?")
    repName = "Scott"
    if params.length > 1
      repName = params[1]
    $.get "https://otcsf.herokuapp.com/app/createRep/#{repName}", (config) ->
      content$ = $(".portfolio-review-image")
      content$.html('')
      OT.Archive.prototype.destroy = ->
      window.OTCSF.otcs = OTCS.initRep(config.apiKey, config.sessionId, config.token, {showTextChat: false, showInviteFlow: true, element: $(".portfolio-review-image")[0]})
      pollArchive = ->
        console.log "polling archive, customer info"
        if( !window.OTCSF.otcs.customer || !window.OTCSF.otcs.customer.id ) then return
        console.log window.OTCSF.otcs.customer
        console.log window.OTCSF.otcs.customer.id
        cid = window.OTCSF.otcs.customer.id
        $.get "https://otcsf.herokuapp.com/is-archive-ready/#{cid}", (result) ->
          console.log "polling..."
          console.log result
          if( result && result.name )
            if( !createdArchive )
              createdArchive = true
              OTCSF.addArchive( {title: result.name.split("#####")[0], time: result.createdAt} )
            if( result.url && result.url.length > 10)
              OTCSF.archiveReady( {url: result.url, duration: result.duration*1000 } )
              console.log "Archive is ready"
              clearInterval( pollInterval )
      window.OTCSF.otcs.on "state", (event) ->
        if(event.state == "connected")
          pollInterval = setInterval( pollArchive, 2000 )
