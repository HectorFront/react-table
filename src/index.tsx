import 'bootstrap/dist/css/bootstrap.min.css';
import React, {Fragment, memo, useCallback, useEffect, useState} from 'react';

type Results = {
	start: number,
	end: number,
	total: number
}

interface Props {
	data: object[],
	maxRows?: number,
	loading?: boolean,
	columns: object[],
	themeTable?: string,
	themeLoader?: string,
	maxPagination?: number,
	emptyDataMessage?: () => JSX.Element | string,
	showResultsMessage?: (object: Results) => JSX.Element | string
}

interface Column {
	value: string,
	header: string,
	hide?: boolean,
	style?: object,
	formatter?: (cell: any, item: object, index: number) => JSX.Element
}

export const DuckTable = memo((props: Props): JSX.Element => {

	const {
		data = [],
		columns = [],
		maxRows = 10,
		loading = false,
		emptyDataMessage,
		showResultsMessage,
		maxPagination = 10,
		themeLoader = 'dark',
		themeTable = 'default'
	} = props;

	const [rows, setRows] = useState<object[] | []>([]);

	const [initialPagination, setInitialPagination] = useState<number>(0);
	const [endPagination, setEndPagination] = useState<number>(maxPagination);

	const [countPagination, setCountPagination] = useState<number>(0);
	const [currentPagination, setCurrentPagination] = useState<number>(1);

	const renderPagination: number[] = Array.from(Array(countPagination).keys()).slice(initialPagination, endPagination);

	const isDecimal = (n: number) => {
		return n % 1 === 0;
	};

	const renderEmptyMessage = (): JSX.Element | string => {
		if(typeof emptyDataMessage === 'function') {
			return emptyDataMessage();
		}
		return !emptyDataMessage ? 'Results not found.' : emptyDataMessage;
	};

	const renderResultsMessage = (): JSX.Element | string => {
		const results: Results = { start: startTable, end: endTable, total: data.length };
		if(typeof showResultsMessage === 'function') {
			return showResultsMessage(results);
		}
		return (
			<span className="text-muted">
				{!showResultsMessage
					? `Showing from ${results.start} to ${results.end} of ${results.total} results`
					: showResultsMessage // string custom
				}
			</span>
		);
	};

	const renderCell = useCallback((index: number, value: any) => {
		if(index < 1) {
			return <th key={index} scope="row">{value}</th>
		} else {
			return <td key={index}>{value}</td>
		}
	},[]);

	const fullPrevious = () => {
		setCurrentPagination(1);
		setInitialPagination(0);
		setEndPagination(maxPagination);
	}

	const fullNext = () => {
		setCurrentPagination(countPagination);
		setInitialPagination(countPagination - (maxPagination - 1));
		setEndPagination(countPagination);
	}

	const previous = () => {
		if(currentPagination > 1) {
			setPagination(currentPagination - 1);
		}
	}

	const next = () => {
		if(currentPagination !== countPagination) {
			setPagination(currentPagination + 1);
		}
	}

	const setPagination = (pagination: number): void => {
		setCurrentPagination(pagination);
		const index: number = pagination - 1;
		if(index < renderPagination[0]) {
			setInitialPagination(index - (maxPagination - 1));
			return setEndPagination(index + 1);
		}
		if(index > renderPagination.pop()) {
			setInitialPagination(index);
			return setEndPagination(index + maxPagination);
		}
	};

	useEffect(() => {
		if(data.length) {
			const length: number = data.length;
			const pagination: number = length / maxRows;
			if(isDecimal(pagination)) {
				setCountPagination(pagination);
			} else {
				const count: number = parseInt(String(pagination)) + 1;
				setCountPagination(count);
			}
			if(pagination < countPagination) {
				previous();
			}
		}
	},[data]);

	useEffect(() => {
		if(data.length) {
			let dataRows: object[] | undefined;
			let arr: object[] = data.slice();
			if(currentPagination > 1) {
				const min = (maxRows * currentPagination) - maxRows;
				const max = min + maxRows;
				dataRows = arr.slice(min, max);
			} else {
				dataRows = arr.slice(0, maxRows);
			}
			setRows(dataRows);
		}
	},[currentPagination, data]);

	const startTable: number = (maxRows * currentPagination + 1) - maxRows;
	const endTable: number = (currentPagination * maxRows) - (maxRows - rows.length);
	return (
		<Fragment>
			<table className={`table table-${themeTable} mb-0`}>
				<thead>
				<tr>
					{columns.map((column: Column, index) => {
						if(!column.hide) {
							return <th key={index} style={!column.style ? {} : column.style} scope="col">{column.header}</th>;
						} else {
							return null;
						}
					})}
				</tr>
				</thead>
				{(data.length && !loading) ?
					<tbody>
					{rows.map((item: any, index: number) =>
						<tr key={index}>
							{columns.map((column: Column, index) => {
								if(!column.hide) {
									const cell = item[column.value];
									if (column.formatter) {
										const formatterCell = column.formatter(cell, item, index);
										return renderCell(index, formatterCell);
									} else {
										return renderCell(index, cell);
									}
								} else {
									return null;
								}
							})}
						</tr>
					)}
					</tbody>
					:
					<tbody/>
				}
			</table>
			{loading ?
				<div className='w-100 text-center p-5'>
					<div className={`spinner-border text-${themeLoader}`} role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
				:
				Boolean(!data.length) &&
				<div className='w-100 text-center p-5'>
					<small>{renderEmptyMessage()}</small>
				</div>
			}
			{countPagination > 1 &&
				<nav
					aria-label="pagination"
					className={`d-flex align-items-center justify-content-between bg-${themeTable} p-3`}
				>
					{countPagination > 1 && renderResultsMessage()}
					<ul className="pagination mb-0">
						<li className="page-item" onClick={fullPrevious}>
							<a className="page-link" href="#">{'<<'}</a>
						</li>
						<li className="page-item" onClick={previous}>
							<a className="page-link" href="#">{'<'}</a>
						</li>
						{renderPagination.map(pagination => {
							return (
								<li
									key={pagination}
									aria-current="page"
									onClick={() => setPagination(pagination + 1)}
									className={currentPagination === pagination + 1 ? 'page-item active' : 'page-item'}
								>
									<a className="page-link" href="#">{pagination + 1}</a>
								</li>
							)
						})}
						<li className="page-item" onClick={next}>
							<a className="page-link" href="#">{'>'}</a>
						</li>
						<li className="page-item" onClick={fullNext}>
							<a className="page-link" href="#">{'>>'}</a>
						</li>
					</ul>
				</nav>
			}
		</Fragment>
	);
});
