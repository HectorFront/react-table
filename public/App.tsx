import React, {useEffect, useState} from 'react';

import DuckTable from '../src';

type Item = {
	id: number,
	description: string,
	value: number,
	store: string,
	date: string
}

type Results = {
	start: number,
	end: number,
	total: number
}

export const App = (): JSX.Element => {

	const [data, setData] = useState<object[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const actions = (_cell: any, row: object, index: number) => {
		return <span>Custom</span>;
	};

	const columns = [{
		header: 'ID',
		value: 'id',
		hide: true
	}, {
		header: 'Description',
		value: 'description',
	}, {
		header: 'Value',
		value: 'value',
	}, {
		header: 'Store',
		value: 'store',
	}, {
		header: 'Date',
		value: 'date',
	}, {
		header: 'Actions',
		value: '',
		formatter: actions,
		headerAlign: 'center',
		classNameRow: 'class-row',
		styleHeader: { width: 150 },
		classNameHeader: 'class-column',
		attrsRow: { 'data-row': 'row' },
		styleRow: { backgroundColor: '#d5d5d5' },
		attrsHeader: { 'data-header': 'header' }
	}];

	useEffect(() => {
		let rows = 10000;
		let arr: Item[] = [];
		const add = () => {
			let item: Item = {
				id: 0,
				value: 0,
				store: 'Apple',
				date: '12/11/2002',
				description: 'Iphone'
			};
			for(let i = 1; i <= rows; i++) {
				arr.push({ ...item, id: i, value: i });
				if(i === rows) setLoading(false);
			}
			setData(arr);
		}
		add();
		// setTimeout(() => {
		// 	rows = 4000;
		// 	arr = [];
		// 	add();
		// }, 5000);
		// change data in real time
	},[]);

	return (
		<DuckTable
			data={data}
			columns={columns}
			/* Optional */
			/* -------- */
			    // sort
			    sortData
				// limits
				maxRows={15}
				maxPagination={5}
				// themes
				loading={loading}
				themeTable='light'
				themeLoader='default'
				colorActivePage={'red'}
				// Pagination
				textNext={'Next'}
				textPrevious={'Previous'}
				textFullNext={'Full next'}
				textFullPrevious={'Full previous'}
				// Messages
				emptyDataMessage={() => <span>My message.</span>} // jsx or text
				showResultsMessage={({ start, end, total }: Results) => (  // jsx or text
					<span style={{ color: 'gray' }}>My results</span>
				)}
				// Events
				onClickRow={(e: object, row: object, index: number) => console.log(e, row, index)}
				onDoubleClickRow={(e: object, row: object, index: number) => console.log(e, row, index)}
			/* -------- */
		/>
	);
}
