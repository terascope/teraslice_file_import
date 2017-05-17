# Reader - teraslice_file_import

To install from the root of your teraslice instance.

```
npm install terascope/teraslice_file_import
```

# Description

Import JSON format data from a file or directory of files.

# Output

Array of JSON format records.

# Parameters

| Name | Description | Default | Required |
| ---- | ----------- | ------- | -------- |
| path | Path to where the file is located on disk' | | Y |
| file_type | may be set to either "file" or "import", determines how to parse the file | file | Y |

# Job configuration example

```
    {
      "_op": "teraslice_file_import",
      "path": "some/path/to/file",
      "file_type": "file"
    },

```

# Notes

`file_type: 'import'` is used under the assumption that teraslice_file_export was used to store the file. Data is exported as an array of documents. The "file" setting assumes that each line of the file is a separate document which are individually parsed as JSON data.   
