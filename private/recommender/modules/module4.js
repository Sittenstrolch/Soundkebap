'use strict'
/*
Module gets own playlists and playlists from other users and returns songs from similar users

*/
const soundcloud = require(__dirname + '/../../soundcloud/connector.js')
const q = require('q');


module.exports = {
  getRecommendation
}

function getRecommendation(user){
  var deferred = q.defer()



  return deferred.promise

}
