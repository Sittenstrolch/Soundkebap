'use strict'
/*
 Module gets own playlists and playlists from other users and returns songs from similar users

 */
const soundcloud = require(__dirname + '/../../soundcloud/connector.js')
const q = require('q')
const helperModule = require(__dirname + '/helperModule.js')


module.exports = {
    getRecommendation
}

function getRecommendation(user, otherUsers, factor){
    var deferred = q.defer()

    var userTracks = {}

    for(var i=0;i<user.length;i++){
        for(var j=0;j<user[i].playlists.length;j++){

            var playlist = user[i].playlists[j]

            for(var k=0;k<playlist.length;k++){

                var trackId = playlist[k]

                if(userTracks.hasOwnProperty(trackId)){
                    userTracks[trackId] ++
                }
                else{
                    userTracks[trackId] = 1
                }
            }
        }
    }

    var otherUserTracks = []
    for(var i=0;i<otherUsers.length;i++){
        var otherTracks = {}
        for(var j=0;j<otherUsers[i].playlists.length;j++){

            var playlist = otherUsers[i].playlists[j]

            for(var k=0;k<playlist.length;k++){

                var trackId = playlist[k]

                if(otherTracks.hasOwnProperty(trackId)){
                    otherTracks[trackId] ++
                }
                else{
                    otherTracks[trackId] = 1
                }
            }
        }
        otherUserTracks.push({"user_id":otherUsers[i].user_id,"tracks":otherTracks})
    }

    var similarUsers = []
    for(var i=0;i< otherUserTracks.length;i++){
        var userId = otherUserTracks[i].user_id
        var similarity = 1
        var unionOfSongs = Object.keys(userTracks).length

        for(var track in otherUserTracks[i].tracks){
            if(userTracks.hasOwnProperty(track))
                similarity = similarity + userTracks[track] + otherUserTracks[i].tracks[track]
            else
                unionOfSongs ++
        }
        similarUsers.push({"user_id":userId,"similarity":similarity/unionOfSongs})
    }

    similarUsers = similarUsers.sort(function(a,b){return b.similarity - a.similarity})

    var similarities = {}
    for(var i=0; i<similarUsers.length; i++){
        similarities[similarUsers[i].user_id] = similarUsers[i].similarity
    }

    var recommendedTracks = {}

    for(var i=0;i<otherUserTracks.length;i++){

        var userId = otherUserTracks[i].user_id
        if(similarities.hasOwnProperty(userId)){

            for(var track in otherUserTracks[i].tracks){
                var value = similarities[userId]

                if(recommendedTracks.hasOwnProperty(track)){
                    recommendedTracks[track] += value
                }
                else{
                    recommendedTracks[track] = value
                }
            }
        }
    }

    helperModule.getNormalizedTracks(recommendedTracks, factor).then(function(normalizedTracks){
        deferred.resolve(normalizedTracks)
    })

    return deferred.promise

}
