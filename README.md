# CSView

CSView is a command line utility for viewing CSV files in a terminal.

```
npm install -g csview
```

## Usage

```
csview my-csv-file.csv
csview a-csv-file.csv --column=ID,NAME,EMAIL
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
