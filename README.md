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
