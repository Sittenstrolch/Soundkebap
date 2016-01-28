'use strict'
/*
 Short Module description

 */

const module1 = require(__dirname + '/modules/module1.js'),
    module2 = require(__dirname + '/modules/module2.js'),
    module3 = require(__dirname + '/modules/module3.js'),
    module4 = require(__dirname + '/modules/module4.js'),
    soundcloud = require(__dirname + '/../soundcloud/connector.js'),
    SC = require('node-soundcloud'),
    q = require('q')

module.exports = {
    getRecommendation,
    collectValuesFromModules
}

function getTracksFromOtherUsers(id){
    const deferred = q.defer()

    soundcloud.getConnections(id).then(function(connections){
        soundcloud.getTracks(connections, "").then(function(tracks){
            deferred.resolve(tracks)
        })

    })

    return deferred.promise
}

function collectValuesFromModules(user, tracks, topSongs, userGroup){
    var deferred = q.defer()
    var promises = []

    var factors = []
    switch (userGroup){
        case 'A': factors =[5,5,1,1];break;
        case 'B': factors =[1,1,5,1];break;
        case 'C': factors =[1,1,1,5];break;
        default : factors =[1,1,1,1];break;
    }

    var lookup = {}
    if(user.hasOwnProperty("lookup") && tracks.hasOwnProperty("lookup"))
        lookup = Object.assign(user.lookup,tracks.lookup)

    promises.push(module1.getRecommendation(tracks.playlists,factors[0]))
    promises.push(module2.getRecommendation(tracks.favorites,factors[1]))
    promises.push(module3.getRecommendation(user.favorites, user.playlists ,tracks.tracks,20,factors[2]))
    promises.push(module4.getRecommendation(user.playlists, tracks.playlists,factors[3]))

    q.all(promises).then(function(response){
        var tracks = {}

        for(var i=0;i<response.length;i++){
            for(var j=0;j<response[i].length;j++){
                var track = response[i][j]
                if(tracks.hasOwnProperty(track.id)){
                    tracks[track.id] += track.value
                }
                else{
                    tracks[track.id] = track.value
                }
            }
        }

        var sortedTracks = []
        for(let track in tracks){
            if(Object.keys(lookup).length > 0)
                lookup[track].value = tracks[track]
            sortedTracks.push([track, tracks[track]])
        }
        sortedTracks.sort(function(a, b) {return b[1] - a[1]})

        var trackIds = sortedTracks.map(function ( track ) { return track[0] })
        trackIds = trackIds.slice(0,topSongs)

        //enrich songs with information
        if(Object.keys(lookup).length > 0){
            var recommendedTracks = []
            for(let i=0;i<trackIds.length;i++){
                recommendedTracks.push(lookup[trackIds[i]])
            }
            deferred.resolve(recommendedTracks)
        }
        else{
            //for evaluation
            deferred.resolve(trackIds)
        }


    })

    return deferred.promise
}

function getRecommendation(user){
    var deferred = q.defer()
    var promises = []

    promises.push(soundcloud.getTracks([user.id],user.accessToken))
    promises.push(getTracksFromOtherUsers(user.id))

    var userGroup = user.testGroup

    q.all(promises).spread(function(user, tracks){

        collectValuesFromModules(user, tracks,1000,userGroup).then(function(rankedTracks){
            deferred.resolve(rankedTracks)
        })

    })

    return deferred.promise
}

    //Jan: 82147580
    //Basti: 131842115
   //getRecommendation({
   //    "accessToken":  "1-162111-131842115-01c04c60d99c9" ,
   //    "avatar_url": "https://i1.sndcdn.com/avatars-000171042308-wepww8-large.jpg",
   //         "city":  "Perleberg" ,
   //         "country": null ,
   //         "description":  "" ,
   //         "discogs_name": null ,
   //         "first_name":  "CHRIS." ,
   //         "followers_count": 203 ,
   //         "followings_count": 11 ,
   //         "full_name":  "CHRIS. TIAN" ,
   //         "id": 131842115 ,
   //         "kind":  "user" ,
   //         "last_modified":  "2015/09/01 18:52:48 +0000" ,
   //         "last_name":  "TIAN" ,
   //         "myspace_name": null ,
   //         "online": false ,
   //         "permalink":  "christian2386" ,
   //         "permalink_url": "http://soundcloud.com/christian2386",
   //         "plan":  "Free" ,
   //         "playlist_count": 0 ,
   //         "public_favorites_count": 14 ,
   //         "subscriptions": [ ],
   //         "testGroup":  "C" ,
   //         "track_count": 13 ,
   //         "uri": "https://api.soundcloud.com/users/5426836",
   //         "username":  "CHRIS.TIAN" ,
   //         "website": null ,
   //         "website_title": null
   //     }
   //).then(function(response){
   //       console.log("\nFinal Recommendation\n======================\n")
   //       console.log(response)
   //   })
