import React from 'react';
import styles from './TableScrollbar.module.css';

const TableScrollbar = ({ children }) => {
    return (
        <div className={`${styles.scrollbarThin} min-w-full overflow-x-auto`}>
            <div className="inline-block min-w-full align-middle">
                {children}
            </div>
        </div>
    );
};

export default TableScrollbar;