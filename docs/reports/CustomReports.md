# Custom reports
Trellis allows researchers to create custom reports by writing PHP code to generate CSV reports. 

These files are written to disk as a stream of data so that the reports can still be created even when the data exceeds the amount of memory available. The major caveat to streaming CSV files is that all columns have to be known ahead of time. In some situations it can be difficult to know which columns will be required for the report.

## Optional setup
It's recommended to configuring a read-only user for accessing the Trellis database before writing custom reports to avoid accidentally corrupting or modifying your database.
1. Create the read-only user in the database 
    - `CREATE USER '$user'@'localhost' IDENTIFIED BY '$password';`
1. Configure Trellis to use this user for reports.
    - Add matching `REPORTS_USERNAME` and `REPORTS_PASSWORD` to the .env

## Creating a report
Add a custom report to Trellis by creating a file in the `trellis-api/app/Reports/custom` directory. The file must end with `Report.php` and define a class that matches the filename.

More examples can be found in the [examples][1] directory in Trellis API.

### Export table to CSV
```php
<?php
// example file location -> trellis-api/app/Reports/examples/SimplestReport.php

namespace App\Reports;

class SimplestReport extends Base {

  // This is the name used to identify the report in the user interface
  public $name = 'simple_report';

  // This method is called when the report runs
  public function handle ($config) {

    // Simply stream a table to a CSV file.
    $this->streamTable('user');

  }

}
```


## Custom Report interface

### Methods
| Method | Description |
| ------ | ----------- |
| `DB()` | Get a [Laravel database connection][2] |
| `Model(string $modelName)` | Get a [Laravel ORM Model][3] by name |
| `tableColumns(string $table)` | Return an array of columns for this table |
| `streamTable(string $table, string $name = '', string $type = 'data', int $chunkSize = 400)` | Stream a table to a CSV file using the name of the table |
| `mapQuery ($cb, $query, array $headers, string $name = 'name', string $type = 'data', int $chunkSize = 400)` | Transform a query row by row using a mapping function. This streams the transformation to disk. |
| `streamQuery ($query, array $headers, string $name = '', string $type = 'data', int $chunkSize = 400)` | Stream the provided query to a CSV file using the provided headers |
| `createFile (string $name = '', string $type = 'data')` | Create a CSV stream |

### Properties
| Property | Default | Description |
| -------- | ------- | ----------- |
| `$configSchema` | `[ 'studyId' => 'string|exists:study,id' ]` | The schema to use to validate the configuration which is passed to this report. See [Laravel validators][4] for options.|

[1]: https://github.com/human-nature-lab/trellis-api/tree/master/app/Reports/examples
[2]: https://laravel.com/docs/5.8/queries
[3]: https://laravel.com/docs/5.8/eloquent
[4]: https://laravel.com/docs/5.8/validation#quick-writing-the-validation-logic