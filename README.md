# Reader - teraslice_file_import

To install from the root of your teraslice instance.

```
npm install terascope/teraslice_file_import
```

# Description

This will read files from the given directory and any subdirectory 

# Expected Inputs

This is a reader, it is passed a file path from the slicer

# Output

an array of records

# Job configuration example
In this example job, the reader will parse any files located at /Users/fs/test and return an array that will be used to additionally parsed and sent up to the index call exampleIndex
```
{
 "name": "Reindex Events",
 "slicers":1,
  "lifecycle": "once",
  "analytics": true,
  "workers": 4,
  "operations": [
    {
      "_op": "teraslice_file_import",
      "path": "/Users/fs/test",
      "format": "json_lines"
    },
    {
       "_op": "elasticsearch_index_selector",
       "index": "exampleIndex",
       "type": "events",
       "date_field_name": "created"
    },
    {
       "_op": "elasticsearch_bulk",
       "size": 5000
    }
  ]
}

```


# Configuration

| Configuration | Description | Type |  Notes
|:---------: | :--------: | :------: | :------:
path | path to directory where the data will be saved to, directory must pre-exist | String | required
format | format in which it exports the data to a file. If set to json_array then it saves it as an array, or if set to json_lines then each record is separated by a new line | String | optional, defaults to json_lines


format set to "json_lines" is used under the assumption that teraslice_file_export was used to store the file, it saves each document on a new line. The "json_array" setting assumes all of the docs are saved as an array.   
