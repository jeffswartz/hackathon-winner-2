TBB.AccountController = Em.ObjectController.extend
  needs: ['application']
  sharedContent: []
  isSharedContentOpen: true
  firstMeeting:(->
    @get('meetings')[0]
  ).property('meetings')
  meetings: [
    {
      title: 'Portfolio Review'
      rep:
        id: 'Scott'
        name: 'Scott Small'
      time: moment('01:30pm', 'hh:mma')
      isToday: true
    }
    {
      title: 'Investment Tips Session'
      rep:
        id: 'Scott'
        name: 'Scott Small'
      time: 1392903000000
    }
    {
      title: '401k Updates'
      rep: {
        id: 'Scott'
        name: 'Scott Small'
      }
      time: 1397482200000
    }
  ]
  archives: [
    {
      title: "401k Update"
      time: 1384416000000
      url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
      duration: 1339000
    }
    {
      title: "Portfolio Review"
      time: 1371043282000
      url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
      duration: 754000
    }
    {
      title: "Portfolio Updates"
      time: 1363849200000
      url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
      duration: 552000
    }
  ]
  chat: false

  showMeeting:(->
    meeting = @get('newMeeting')
    if meeting
      $('#meetingModal').modal('show')

  ).observes('newMeeting')
  actions:
    startChat: ->
      # alert("hellos")
      # window.OTCSF.startChat(true)
      window.startOTSession()
    showSharedContent: ->
      $('#sharedContent').collapse('show')
      @set 'isSharedContentOpen', true
    hideSharedContent: ->
      $('#sharedContent').collapse('hide')
      @set 'isSharedContentOpen', false
  setOTCSF:(->

    window.OTCSF = {}
    window.OTCSF.addSharedContent = (contentModel) =>
      # remove this stub or it wont work
      contentModels = [url: 'http://i.imgur.com/YrkHK2r.png']

      if contentModel == 0
        contentModels = [
          {
            title: 'The U.Fund College Investing Plan Performance'
            url: 'images/graph_1.png'
          }
        ]
      else
        contentModels = [
          {
            title: 'UNIQUE College Investing Plan Performance'
            url: 'images/graph_2.png'
          }
        ]


      @set 'sharedContent', contentModels
    window.OTCSF.startChat = (boolean) => @set 'chat', boolean
    window.OTCSF.showNewMeeting = (meeting) =>
      if moment(meeting.time).format('DDMMMYYYY') == moment().format('DDMMMYYYY')
        meeting.isToday = true
      else
        meeting.isToday = false

      meetings = @get('meetings')
      meetings.pushObject(meeting)
      sortedMeetings = quickSortTime meetings
      @set 'meetings', sortedMeetings
      @set('newMeeting', meeting)
    window.OTCSF.addArchive = (archive) =>
      archives = @get('archives').toArray()
      archives.unshiftObject archive
      @set 'archives', archives
      @set 'archivePending', true
    window.OTCSF.archiveReady = (data) =>
      archives = @get('archives').toArray()
      archives[0].url = data.url
      archives[0].duration = data.duration
      @set 'archives', archives
      @set 'archivePending', false
  ).observes('model')

  archivePending: false

  totalCash: '127,559.33'
  totalEquity: '141,112.96'
  totalFixed: '164,832.21'
  totalRetirement: '198,451.43'


getRandomInt = (min, max) -> Math.floor(Math.random() * (max - min + 1)) + min

creditInfo =
  address: [
    'Cash deposit ATM'
    'Cash deposit teller'
  ]
  num: [
    'Check deposit'
    'Electronic transfer'
  ]
debtInfo =
  address: [
    'Withdrawal ATM'
    'Withdrawal Teller'
  ]
  num: [
    'VISA'
    'MasterCard'
  ]

quickSortTime = (arr) ->
  return []  if arr.length is 0
  lesser = []
  greater = []
  head = arr[0]
  i = 1

  while i < arr.length
    if arr[i].time < head.time
      greater.push arr[i]
    else
      lesser.push arr[i]
    i++
  quickSortTime(greater).concat head, quickSortTime(lesser)
