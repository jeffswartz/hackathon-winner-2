TBB.ChatWidgetComponent = Ember.Component.extend
  yOffset: window.pageYOffset
  setYOffset: ->
    #console.log(window.pageYOffset)
    @set 'yOffset', window.pageYOffset
  shouldChatStick: (->
    @get('yOffset') > 75
  ).property('yOffset')
  didInsertElement: ->
    # Add scroll listener
    $(window).on('scroll', $.proxy(this.setYOffset, this))
    
    OTCS.setStrings({ "In the queue": "", "Approx wait": "", "$time mins":"Waiting For Advisor" })
    createdArchive = false
    $.get "https://otcsf.herokuapp.com/app/createCustomer", (config) ->
      content$ = $(".chat-widget")
      content$.html('')
      OT.Archive.prototype.destroy = ->
      otcs = OTCS.initCustomer(config.apiKey, config.sessionId, config.token, {showTextChat: false, element: $(".chat-widget")[0]})
      pollArchive = ->
        $.get "https://otcsf.herokuapp.com/is-archive-ready/#{config.customerId}", (result) ->
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
      otcs.on "state", (event) ->
        if(event.state == "connected")
          pollInterval = setInterval( pollArchive, 2000 )
      otcs.sharedData.on "changed:meeting", (newValue) ->
        console.log "New Meeting from rep! Check console to view details"
        console.log newValue
        OTCSF.showNewMeeting( newValue )
      otcs.sharedData.on "changed:sharedContent", (newValue) ->
        console.log "New Shared Content from rep!!!"
        console.log newValue
        window.OTCSF.addSharedContent( newValue )
    # $('.chat-widget').draggable
    #   snap: '.container'
    #   snapMode: 'inner'
    #   snapTolerance: 100
