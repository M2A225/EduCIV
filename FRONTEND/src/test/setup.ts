import '@testing-library/jest-dom';
import React from 'react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';

global.React = React;
global.vi = vi;
global.describe = describe;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.afterEach = afterEach;