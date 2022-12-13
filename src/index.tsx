import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, {Fragment, memo, useCallback, useEffect, useState} from 'react';

type Results = {
	end: number,
	start: number,
	total: number
}

type DisablePagination = {
	[key: string]: {
		style: {
			[key: string]: number | string
		},
		disabled: boolean,
		className: string
	}
}

interface Props {
	data: object[],
	maxRows?: number,
	loading?: boolean,
	columns: object[],
	sortData?: boolean,
	themeTable?: string,
	themeLoader?: string,
	maxPagination?: number,
	textNext?: string,
	textFullNext?: string,
	textPrevious?: string,
	colorActivePage?: string,
	textFullPrevious?: string,
	emptyDataMessage?: () => JSX.Element | string,
	onClickRow?: (e: object, object: object, index: number) => any,
	showResultsMessage?: (object: Results) => JSX.Element | string,
	onDoubleClickRow?: (e: object, object: object, index: number) => any
}

interface Column {
	value: string,
	header: string,
	hide?: boolean,
	styleRow?: object,
	attrsRow?: object,
	attrsHeader?: object,
	styleHeader?: object,
	headerAlign?: string,
	classNameRow?: string,
	classNameHeader?: string,
	formatter?: (cell: any, item: object, index: number) => JSX.Element
}

const DuckTable = memo((props: Props): JSX.Element => {

	const {
		onClickRow,
		columns = [],
		maxRows = 10,
		loading = false,
		sortData = false,
		textNext = '>',
		textFullNext = '>>',
		textPrevious = '<',
		textFullPrevious = '<<',
		colorActivePage = '#505050',
		emptyDataMessage,
		onDoubleClickRow,
		showResultsMessage,
		maxPagination = 10,
		themeLoader = 'dark',
		themeTable = 'default'
	} = props;

	const [sort, setSort] = useState<boolean>(false);
	const [rows, setRows] = useState<object[] | []>([]);
	const [data, setData] = useState<object[] | []>([]);

	const [initialPagination, setInitialPagination] = useState<number>(0);
	const [endPagination, setEndPagination] = useState<number>(maxPagination);

	const [countPagination, setCountPagination] = useState<number>(0);
	const [currentPagination, setCurrentPagination] = useState<number>(1);

	const isDecimal = (n: number): boolean => {
		return n % 1 === 0;
	};

	const calcTotalPagination = data.length / maxRows;
	const totalPagination = isDecimal(calcTotalPagination) ? calcTotalPagination : parseInt(String(calcTotalPagination)) + 1;
	const renderPagination: number[] = Array.from(Array(countPagination).keys()).slice(initialPagination, endPagination);

	const startTable: number = (maxRows * currentPagination + 1) - maxRows;
	const endTable: number = (currentPagination * maxRows) - (maxRows - rows.length);

	const disableStartPage: boolean = currentPagination === 1;
	const disableEndPage: boolean = currentPagination === totalPagination;


	const minSlicePage = (maxRows * currentPagination) - maxRows;
	const maxSlicePage = minSlicePage + maxRows;

	const disabledPagination: DisablePagination = {
		start: {
			disabled: disableStartPage,
			className: disableStartPage ? ' opacity-50' : '',
			style: disableStartPage ? { cursor: 'not-allowed' } : {}
		},
		end: {
			disabled: disableEndPage,
			className: disableEndPage ? ' opacity-50' : '',
			style: disableEndPage ? { cursor: 'not-allowed' } : {}
		}
	};

	const stylePagination: { [key: string]: string | number } = {
		border: 0,
		color: 'black',
		boxShadow: 'none'
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

	const renderCell = useCallback((
		index: number, value: any, style: object | undefined, attrs: object | undefined, className: string | undefined
	): JSX.Element => {
		const styleRow = !style ? {} : style;
		const classNameRow = !className ? '' : className;
		if(index < 1) {
			return <th {...attrs} style={styleRow} className={classNameRow} key={index} scope="row">{value}</th>
		} else {
			return <td {...attrs} style={styleRow} className={classNameRow} key={index}>{value}</td>
		}
	},[]);

	const fullPrevious = () => {
		setCurrentPagination(1);
		setInitialPagination(0);
		setEndPagination(maxPagination);
	};

	const fullNext = () => {
		setCurrentPagination(countPagination);
		setInitialPagination(countPagination - (maxPagination - 1));
		setEndPagination(countPagination);
	};

	const previous = () => {
		if(currentPagination > 1) {
			setPagination(currentPagination - 1);
		}
	};

	const next = () => {
		if(currentPagination !== countPagination) {
			setPagination(currentPagination + 1);
		}
	};

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

	const headerSort = () => {
		setSort(currentSort => {
			const isSort = !currentSort;
			const listSort = data.slice().sort().reverse();
			setData(listSort);
			return isSort;
		});
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
			if(currentPagination > countPagination) {
				fullPrevious();
			}
		}
	},[data, countPagination]);

	useEffect(() => {
		if(data.length) {
			let dataRows: object[] | undefined;
			let arr: object[] = data.slice();
			if(currentPagination > 1) {
				dataRows = arr.slice(minSlicePage, maxSlicePage);
			} else {
				dataRows = arr.slice(0, maxRows);
			}
			setRows(dataRows);
		}
	},[currentPagination, data]);

	useEffect(() => {
		setData(props.data);
	},[props.data]);

	return (
		<Fragment>
			<table className={`table table-${themeTable} mb-0`}>
				<thead>
				<tr>
					{columns.map((column: Column, index) => {
						if(!column.hide) {
							return (
								<th
									{...column.attrsHeader}
									key={index}
									scope="col"
									className={column.classNameHeader}
									style={{
										...(column.headerAlign
											? { textAlign: column.headerAlign, ...column.styleHeader } : column.styleHeader
										)
									}}
								>
									<div
										onClick={sortData ? headerSort : null}
										className={`table-content-header${sortData ? ' sort' : ''}`}
									>
										{column.header}
										{sortData &&
											<>&nbsp;<i className={`bi bi-triangle-fill header-sort ${sort ? 'up': 'down'}`}/></>
										}
									</div>
								</th>
							);
						} else {
							return null;
						}
					})}
				</tr>
				</thead>
				{(data.length && !loading) ?
					<tbody>
						{rows.map((item: any, index: number) =>
							<tr
								key={index}
								className='row-duck-table'
								onClick={e => onClickRow(e, item, index)}
								onDoubleClick={e => onDoubleClickRow(e, item, index)}
							>
								{columns.map((column: Column, index) => {
									if(!column.hide) {
										const cell = item[column.value];
										if (column.formatter) {
											const formatterCell = column.formatter(cell, item, index);
											return renderCell(index, formatterCell, column.styleRow, column.attrsRow, column.classNameRow);
										} else {
											return renderCell(index, cell, column.styleRow, column.attrsRow, column.classNameRow);
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
					className={`d-flex align-items-center justify-content-between p-3`}
				>
					{countPagination > 1 && renderResultsMessage()}
					<ul className="pagination mb-0">
						<li
							className={`page-item${disabledPagination.start.className}`}
							onClick={!disabledPagination.start.disabled ? fullPrevious : null}
						>
							<a
								href="#"
								className="page-link"
								style={{...stylePagination, ...(disabledPagination.start.style)}}
							>
								{textFullPrevious}
							</a>
						</li>
						<li
							className={`page-item${disabledPagination.start.className}`}
							onClick={!disabledPagination.start.disabled ? previous : null}
						>
							<a
								href="#"
								className="page-link"
								style={{...stylePagination, ...(disabledPagination.start.style)}}
							>
								{textPrevious}
							</a>
						</li>
						{renderPagination.map(pagination => {
							const active = currentPagination === pagination + 1;
							return (
								<li
									key={pagination}
									aria-current="page"
									className={active ? 'page-item active' : 'page-item'}
									onClick={() => setPagination(pagination + 1)}
								>
									<a
										href="#"
										className="page-link"
										style={{
											...stylePagination,
											...(active ? { color: 'white', backgroundColor: colorActivePage } : {})}}
									>
										{pagination + 1}
									</a>
								</li>
							)
						})}
						<li
							onClick={!disabledPagination.end.disabled ? next : null}
							className={`page-item${disabledPagination.end.className}`}
						>
							<a
								href="#"
								className="page-link"
								style={{...stylePagination, ...(disabledPagination.end.style)}}
							>
								{textNext}
							</a>
						</li>
						<li
							className={`page-item${disabledPagination.end.className}`}
							onClick={!disabledPagination.end.disabled ? fullNext : null}
						>
							<a
								href="#"
								className="page-link"
								style={{...stylePagination, ...(disabledPagination.end.style)}}
							>
								{textFullNext}
							</a>
						</li>
					</ul>
				</nav>
			}
		</Fragment>
	);
});

export default DuckTable;
