'use strict'
/*


 */

const q = require('q')

module.exports = {
    getNormalizedTracks
}

function getNormalizedTracks(tracks, factor){
    var deferred = q.defer()


    if(Object.keys(tracks).length>0){
        var sortedTracks = []
        for(var track in tracks){
            sortedTracks.push([track, tracks[track]])
        }
        sortedTracks.sort(function(a, b) {return b[1] - a[1]})

        var maxCount = sortedTracks[0][1]
        var normalizedTracks = []
        for(var i=0;i<sortedTracks.length;i++){
            var id = sortedTracks[i][0]
            var value = Math.max(0.25,sortedTracks[i][1] / maxCount)
            value *= factor
            normalizedTracks.push({"id":id,"value":value})
        }

        deferred.resolve(normalizedTracks)
    }
    else{
        deferred.resolve({})
    }


    return deferred.promise

}
