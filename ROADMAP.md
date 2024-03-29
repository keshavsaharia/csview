# V0

- [ ] Text and line wrapping
- [ ] Layers
- [ ] Element implementation
- [ ] Table viewer
- [ ] CSV delimiters (tabs, semicolons)
- [ ] Currency formats (with/without symbols, semicolons vs commas)

examples: read a CSV, scroll horizontal/vertical, find/sort/search

Resources:
- https://github.com/datablist/sample-csv-files?tab=readme-ov-file

# V1

- [ ] Output CSV file to HTML table viewer
- [ ] Create schema files in hidden `.csv` folder to store display state
    - `.csv/schema.json` applies to all CSV files in the directory
    - `.csv/schema/file-name.csv` - JSON schema that applies to the specific file name

- [ ] Correlate data between multiple CSV files (foreign keys)
- [ ] Import/export CSV from database
- [ ] Diff between two CSVs `csview a.csv b.csv -diff -key id`

# V2

- [ ] Run script against CSV contents
- [ ] CSV to data website converter

# Examples

- PPP loan data
	- import multiple CSVs from directory and concatenate
	- look for validation errors
