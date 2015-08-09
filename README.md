# Enlargify
Enlargify is a chatroulette or omegle like application which allows users to have video/audio/text chat with random people. It uses EasyRTC project which built on top of WebRTC.

## Online Demo
You can find the demo deployed on heroku at the following address:

http://enlargify.herokuapp.com

## Installation
* Clone the project

  ```
  $wd=/path/to/dir
  git clone https://github.com/merictaze/enlargify.git $wd 
  cd $wd
  ```
* Install node if you do not have already

  ```
  sudo apt-get install node
  ```
* Install the modules

  ```
  npm install
  ```
* Run the application
  ```
  nodejs server.js
  ```
* Check it on your browser http://localhost:5000

## Directory structure
```
enlargify/
├── server.js               : Server side nodejs script
├── index.html              : Main page
├── public/
    ├── libs/
        ├── bootstrap/
        ├── font-awesome/
        ├── jquery/
    ├── resources/
        ├── js/app.js       : Client side javascript
        ├── css/app.css
```

## License
  [MIT](LICENSE)
