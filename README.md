otcs-financial-demo
===================

Demo of OTCS in the context of Financial services


client
===================

###### Run the app:

    cd client/
    npm install
    bower install
    grunt server


###### Build 'dist' folder that should be served up by the back-end

    cd client/
    grunt server:dist

then point web server at `client/dist`

server
===================

    npm install
    supervisor app.js

config vars
============

heroku config:set OTCS_API_KEY=472032 \
OTCS_API_SECRET=fooooo \
OTCS_GUM_SERVER=http://gum.opentok.com/ \
TB_KEY=472032 \
TB_SECRET=fooo \
URL=http://hackathon-winner-2.herokuapp.com/ \
--app hackathon-winner-2


Other notes
===========

git push heroku master
heroku open --app hackathon-winner-2
