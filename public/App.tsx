import React, {useEffect, useState} from 'react';

import {DuckTable} from '../src';

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

	const actions = () => {
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
		style: { width: 200 },
	}];

	useEffect(() => {
		let item: Item = {
			id: 0,
			value: 0,
			store: 'Apple',
			date: '12/11/2002',
			description: 'Iphone'
		};
		let arr: Item[] = []
		const rows: number = 10000;
		for(let i = 1; i <= rows; i++) {
			arr.push({ ...item, id: i, value: i });
			if(i === rows) setLoading(false);
		}
		setData(arr);
	},[]);

	return (
		<DuckTable
			data={data}
			columns={columns}
			/* Optional */
			maxRows={7}
			loading={loading}
			themeTable='default'
			themeLoader='default'
			emptyDataMessage={() => <span>My message.</span>}
			showResultsMessage={({ start, end, total }: Results) => (
				<span style={{ color: 'white' }}>My results</span>
			)}
		/>
	);
}
