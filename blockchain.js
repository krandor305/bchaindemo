var app=require('express')();
var server=require('http').createServer(app);
var io=require('socket.io')(server);
var CryptoJS = require("crypto-js");

users=[];
blockchain=[];
blockverif=[];


app.get('/',function(req,res)
{
    res.sendfile('index.html');
});

io.sockets.on('connection',function(socket)
{

    socket.on('nouveau',function(pseudo){
        socket.pseudo=pseudo;
        socket.emit('generatenew',{users:users,blockchain:blockchain});
        users.push(pseudo);
        socket.broadcast.emit('nouveau',pseudo);
    });

    socket.on('message',function(data){
        io.emit('message',generateblock(socket.pseudo,data.to,data.message));
    });
});

server.listen(process.env.PORT || 8000);

class block
{
    constructor(f,to,amount)
    {
      this.index=blockchain.length;
      this.f=f;
      this.to=to;
      this.amount=amount
      if(this.index==0)
      {this.previoushash=0;}
      else
      {this.previoushash=blockverif[this.index-1].hash;}
      this.hash=CryptoJS.SHA256(this.index+this.previoushash+this.amount);
    }

    is_valid()
    {
        if(this.index!=0)
        {
        if(blockverif[this.index-1].hash!=this.previoushash)
        {
            return false;
        }
        else if(blockverif[this.index-1].index!=this.index-1)
        {
            return false;
        }
        }
        else if(CryptoJS.SHA256(this.index+this.previoushash+this.amount)!=this.hash)
        {
            return false;
        }
        return true;
    }

}

function generateblock(f,to,amount)
{
    var b=new block(f,to,amount);
    if(b.is_valid() || b.index==0)
    {
    blockverif.push(b);
    blockchain.push("index:"+b.index+"<br>from:"+b.f+"<br>to:"+b.to+"<br>amount:"+b.amount+"<br>previous hash:"+b.previoushash+"<br>hash:"+b.hash+"<hr>");
    return "index:"+b.index+"<br>from:"+b.f+"<br>to:"+b.to+"<br>amount:"+b.amount+"<br>previous hash:"+b.previoushash+"<br>hash:"+b.hash+"<hr>";
    }
}



