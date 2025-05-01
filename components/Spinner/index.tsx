import React from "react";

const Spinner = () => {
    return (
        <div className="flex justify-center h-screen">
            <div className="loaderRectangle">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default Spinner;
