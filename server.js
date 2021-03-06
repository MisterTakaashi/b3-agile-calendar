var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = require('./data/users.json');
//var calendar = require('./data/calendars/a.json');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log("Connexion entrante");
    socket.on('connect_user', function(data){
        username = data.username;
        password = data.password;

        socket.emit('connect_user', {result:connectUser(username, password)});
    });

    socket.on('get_calendar', function(data){
		console.log("Demande du calendrier: " + data.id)
		try{
			curFile = fs.readFileSync('./data/calendars/' + data.id + '.json').toString();
			var calendar = JSON.parse(curFile);
		}catch(e){
			var annee = [];
            var semaine = [];
            var jour = {};
            var cours = {matiere: "", salle: "", }
            for ( var i = 16 ; i < 48 ; i++ ) {
              jour[Math.floor(i/2) * 100 + (i%2)*30] = "";
            }

            for ( var j = 0 ; j < 5 ; j++ )
              semaine.push(jour);

            for ( var i = 0 ; i < 52 ; i++ )
              annee.push(semaine);

            var calendar = annee;
			
			try{
				curFile = fs.openSync('./data/calendars/' + data.id + '.json', "w+");
				fs.writeSync(curFile, JSON.stringify(calendar, null, 2));
			}catch(e){
				console.log("Erreur lors de la creation d'un nouveau calendrier");
			}
		}

        socket.emit('get_calendar', calendar);
    });

    socket.on('update_calendar', function(calendar){
		console.log("Calendrier recu !");
        curFile = fs.openSync('./data/calendars/' + calendar.id + '.json', "w+");
        try{
            fs.writeSync(curFile, JSON.stringify(calendar.calendar, null, 2));
            socket.emit('update_calendar', {result:true});
        }
        catch(e){
            socket.emit('update_calendar', {result:false, error:e});
        }
        finally{
            fs.closeSync(curFile);
        }
    })
});

http.listen(3113, function(){
  console.log('listening on *:3113');
});


function connectUser(username, password){
        for (var i = 0; i < users.length; i++) {
            if(users[i].name == username && users[i].password == password)
                return true;
        };
        return false;
}