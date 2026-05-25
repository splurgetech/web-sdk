import basePool from './math_fixtures/base_pool.json';
import baseNoWin from './math_fixtures/base_no_win.json';
import baseCollect from './math_fixtures/base_collect.json';
import baseKronos from './math_fixtures/base_kronos.json';

export default [baseNoWin, baseCollect, baseKronos, ...basePool] as {
	gameType: string;
	events: unknown[];
}[];
