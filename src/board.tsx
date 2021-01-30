import React from 'react';
import ReactDOM from 'react-dom';

let _setShow: any = null;
let _setContent: (content: string[]) => void = (_) => {};
let _onClose: () => void;

export function setBoard(content: string[], onClose: () => void) {
    _setShow(true);
    _setContent(content);
    _onClose = onClose;
}

const Board = () => {
    const [show, setShow] = React.useState(false);
    const [content, setContent] = React.useState(['']);
    _setShow = setShow;
    _setContent = setContent;
    return (<div style={{display: show ? 'inline-block' : 'none'}} onClick={() => (setShow(false), _onClose())}>
        {content.map((c, i) => (<div key={i}>{c}</div>))}
    </div>);
};

ReactDOM.render(
  <Board/>,
  document.getElementById('board'));
