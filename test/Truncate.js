import React, { Component } from 'react';
import { createRenderer, renderIntoDocument } from 'react-addons-test-utils';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import unexpectedDOM from 'unexpected-dom';
import sinon from 'sinon';
import { jsdom } from 'jsdom';
import requestAnimationFrame from 'raf';
import Canvas from 'canvas';
import { stripIndent } from 'common-tags';

import Truncate from '../src/Truncate';

global.document = jsdom();
global.window = global.document.defaultView;
global.window.Canvas = Canvas;
global.window.requestAnimationFrame = requestAnimationFrame;

for (let key in global.window) {
    if (!global[key]) {
        global[key] = global.window[key];
    }
}

const expect = unexpected.clone()
    .use(unexpectedReact)
    .use(unexpectedDOM)
    .addAssertion('<DOMElement> to display text <string>', (expect, subject, value) => {
        function nodeToText(node) {
            return Array.prototype.reduce.call(node.children, (prev, curr) => {
                if (curr instanceof global.window.HTMLBRElement) {
                    return prev += '\n';
                }

                return prev += curr.textContent;
            }, '');
        }

        return expect(nodeToText(subject), 'to equal', stripIndent`${value}`);
    })
;

describe('<Truncate />', () => {
    it('should be a React component', () => {
        expect(Truncate, 'to be a', Component.constructor);
    });

    it('should render a span', () => {
        let renderer = createRenderer();
        renderer.render(<Truncate />);

        expect(renderer, 'to have rendered', <span />);
    });

    it('should truncate text', () => {
        sinon.stub(global.window.HTMLDivElement.prototype,
            'getBoundingClientRect', () => ({ width: 85 })
        );

        let component = renderIntoDocument(
            <div>
                <Truncate lines={2} ellipsis='…'>
                    This text should
                    stop after here
                    and not contain the
                    next lines
                </Truncate>
            </div>
        );

        expect(component.children[0], 'to display text', `
            This text should
            stop after here…
        `);

        global.window.HTMLDivElement.prototype.getBoundingClientRect.restore();
    });
});
