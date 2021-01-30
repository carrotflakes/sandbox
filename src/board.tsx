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

export function close() {
    _setShow && _setShow(false);
}

const Board = () => {
    const [show, setShow] = React.useState(false);
    const [content, setContent] = React.useState(['']);
    _setShow = setShow;
    _setContent = setContent;
    return (
    <div id="board" style={{display: show ? undefined : 'none'}}>
        <div className="board-header">
            <span>Board</span>
            <div className="close-button" onClick={() => (setShow(false), _onClose())}>close</div>
        </div>
        <div className="posts">
            {content.map((c, i) => (<div key={i}>{c}</div>))}
        </div>
        <input type="text" id="inputBox"/>
    </div>);
};

ReactDOM.render(
  <Board/>,
  document.getElementById('boardContainer'));
