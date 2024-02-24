# CSView

CSView is a command line utility for viewing CSV files in a terminal.

```
npm install -g csview
csview any_csv_file.csv
```

## Usage

```
csview my-csv-file.csv
csview a-csv-file.csv --column ID,NAME,EMAIL
```

## Cache

Viewing a CSV in a particular directory may generate a schema file and other metadata in the `.csv` hidden directory.
To prevent caching viewing options and settings, use the `--no-cache` or `-nc` boolean flag.

```
csview --no-cache ...
```


## Schema

```
csview -s schema.json data.csv
```

Where `schema.json` has a JSON schema of the content data.

```
{
	"title": "Customers",
	"column": [
		{
			"id": "ID",
			"name": "Unique identifier",
			"type": "string",
			"width": "auto"
		},
		{
			"id": "Name",
			"name": "Full name",
			"type": "string",
			"width": 20
		},
		{
			"id": "Email",
			"name": "Email address",
			"header": "Email",
			"type": "email",
			"width": 30
		}
	]
}
```

### Column schema

```
interface SchemaColumn {
	id: string
	name?: string
	type?: 'string' | 'number' | 'boolean'
	format?: 'switch'

	// map values to result from file or string mapping
	map?: 'string' | { [value: string]: string }



}
```

## Sorting

Trigger sorting from the command line. Can sort by one or more columns.

```
csview file.csv --sort COLUMN_HEADER
csview file.csv --sort HEADER1,HEADER2 --sort-asc
csview orders.csv --sort ORDER_TYPE,NAME,ORDER_DATE --sort-desc
```

Sorting large CSV files requires `csview` to stream the entire file into memory, so it is a good idea to
set the `--max-old-space-size` node option correspondingly.

```
NODE_OPTIONS=--max_old_space_size=8096 csview bigfile.csv
```

## Searching
