# Server Configuration
The server configuration controls all of the frontend variables that may change with the environment that Trellis is deployed in. Many of them apply to both the Trellis mobile app and the web application.


## Configuration options

- **appMode**: Indicates if this is a development or production version of Trellis.
- **debug**: Is Trellis in debug mode.
- **demo.expirationTime**: How long an email confirmation should be valid for.
- **formBuilderUrl**: The template for the embedded form builder.
- **logging.console**: Should the logger print to the console.
- **logging.levels**: Which levels should be logged.
- **logging.max**: How many logs to keep in the memory queue before it is flushed.
- **logging.rate**: How frequently to flush the logging queue.
- **mapTileLayer.accessToken**: The Open Street Maps API token to use for this server.
- **mapTileLayer.attribution**: The HTML to use for attribution. This is required by the Open Street Maps API.
- **mapTileLayer.id**: 
- **mapTileLayer.maxZoom**: How far the user should be able to zoom into the map.
- **mapTileLayer.style**: The style to use for the maps.
- **sentry.dsn**: The DSN number for the sentry logger configured for this server.
- **sentry.onlineIntervalRate**: How often the mobile app should check if the tablet is online. When a tablet is found to be online, logs will be uploaded.
- **serverMode**: Indicates if the server is in `test`, `prod` or `demo` mode.
- **siteName**: This value is used in automated emails sent by Trellis.
- **webRoot**: The root of the Trellis web app.
