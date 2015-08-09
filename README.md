# Enlargify
> Enlargify is a chatroulette or omegle like application which allows users to have video/audio/text chat with random people. It uses EasyRTC project which built on top of WebRTC.
<hr>

# Table of Contents

* [Online Demo](#demo)
* [Installation](#installation)
* [Directory Structure](#structure)
* [License](#licence)

## <a name="demo"></a>Online Demo
You can find the demo deployed on heroku at the following address:

http://enlargify.herokuapp.com

## <a name="installation"></a>Installation
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

## <a name="structure"></a>Directory Structure
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

## <a name="licence"></a>License
  [MIT](LICENSE)
