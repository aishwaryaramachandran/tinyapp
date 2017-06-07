function generateRandomString() {
    var text = " ";

    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}
console.log(generateRandomString());