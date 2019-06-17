# Server config on the mobile app
This is typically the first thing that is done once Trellis has been installed on a mobile device. This step must
 be completed before data can by synchronised with the Trellis server.

Simply enter the server IP address or full domain of the API server. The port can also be included.
Some examples of valid entries include:  `api.trellisdemo.net`, `https://api.trellisdemo.net`, `http://10.0.1.10:8082`

If the protocol (http or https) is not included, Trellis will attempt to use https. While it is possible, it is not
recommended to use http with Trellis as this will not keep your data secure.
