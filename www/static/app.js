(function () {
    var app = angular.module("default-app", []); 
    app.controller("data-controller", ['$q', '$http', '$scope', function($q, $http, $scope) {

        var self = $scope;
        
        self.pub = {
            loading: false,
            sensors: [],
            data: [],
            state: null
        };
        
        var updateState = () => {
            self.pub.state = self.pub.sensors.map(s => {
                let lastpoint = self.pub.data.filter(x => x.sensor == s).pop() || {
                    data: "NA",
                    dt: "NA"
                };
                return {
                    name: s,
                    temp: lastpoint.data,
                    updated: lastpoint.dt
                }
            });
        };

        var loadData = (url, callback) => {
            self.pub.loading = true;
            $http.get(url).then(resp => {
                callback(resp.data);
                updateState();
                self.pub.loading = false;
            }, err => {
                console.error(err);
                self.pub.loading = false;
                self.pub.err.push(err);
            });
        };

        (function() {
            let f =  () => { loadData("/data", (data) => {
                self.pub.sensors = data
                    .map(x => x.sensor)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .sort();
                self.pub.data = data;
            })};
            
            setInterval(f, 5 * 1000);
            f();
        })();

    }]);
})();