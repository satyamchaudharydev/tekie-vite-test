import { get } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import Select, { components } from "react-select";
import '../../pages/TimeTable/components/CreateSessionModal/styles.scss'

const TekieAmethyst = '#8C61CB'

const { MenuList, ValueContainer, SingleValue, Placeholder } = components;

const CustomMenuList = ({ selectProps, ...props }) => {
  const { onInputChange, inputValue, onMenuInputFocus } = selectProps;

  // Copied from source
  const ariaAttributes = {
    "aria-autocomplete": "list",
    "aria-label": selectProps["aria-label"],
    "aria-labelledby": selectProps["aria-labelledby"]
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          textAlign: 'center'
        }}
      >
        <input
          id="topic-modal-input"
          className="modal__dropdown-input"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          type="text"
          value={inputValue}
          onChange={(e) =>
            onInputChange(e.currentTarget.value, {
              action: "input-change"
            })
          }
          onMouseDown={(e) => {
            e.stopPropagation();
            e.target.focus();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.target.focus();
          }}
          onFocus={onMenuInputFocus}
          placeholder="Search Topic Name"
          {...ariaAttributes}
        />
      </div>
      <MenuList {...props} selectProps={selectProps} />
    </>
  );
};

// Set custom `SingleValue` and `Placeholder` to keep them when searching
const CustomValueContainer = ({ children, selectProps, ...props }) => {
  const commonProps = {
    cx: props.cx,
    clearValue: props.clearValue,
    getStyles: props.getStyles,
    getValue: props.getValue,
    hasValue: props.hasValue,
    isMulti: props.isMulti,
    isRtl: props.isRtl,
    options: props.options,
    selectOption: props.selectOption,
    setValue: props.setValue,
    selectProps,
    theme: props.theme
  };

  return (
    <ValueContainer {...props} selectProps={selectProps}>
      {React.Children.map(children, (child) => {
        return child ? (
          child
        ) : props.hasValue ? (
          <SingleValue
            {...commonProps}
            isFocused={selectProps.isFocused}
            isDisabled={selectProps.isDisabled}
          >
            {selectProps.getOptionLabel(props.getValue()[0])}
          </SingleValue>
        ) : (
          <Placeholder
            {...commonProps}
            key="placeholder"
            isDisabled={selectProps.isDisabled}
            data={props.getValue()}
          >
            {selectProps.placeholder}
          </Placeholder>
        );
      })}
    </ValueContainer>
  );
};

const TopicDropdown = ({ styles, groupedOptions, setFieldValue, teacherApp,selectInputRef}) => {
  const containerRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
 
  const customStyles = {
    ...styles,
    menuList: (style) => ({
      ...style,
      '&::-webkit-scrollbar-thumb': {
        background: TekieAmethyst,
      }
    })
  }
  const onDomClick = (e) => {
    let menu = containerRef.current.querySelector(".select__menu");

    if (
      !containerRef.current.contains(e.target) ||
      !menu ||
      !menu.contains(e.target)
    ) {
      setIsFocused(false);
     
    }
  };

  const getModifiedGroupedOptions = (options) => {
    return options.map(option => ({ ...option, label: option.title, value: option.id }))
  }

  useEffect(() => {
    document.addEventListener("mousedown", onDomClick);

    return () => {
      document.removeEventListener("mousedown", onDomClick);
    };
  }, []);



  return (
    <div ref={containerRef}>
      <Select
      ref={selectInputRef}
        placeholder={'Select topic'}
        className="basic-single"
        classNamePrefix="select"
        name="color"
        options={getModifiedGroupedOptions(groupedOptions)}
        components={{
          MenuList: CustomMenuList,
          ValueContainer: CustomValueContainer,
          IndicatorSeparator: () => null,
        }}
        styles={customStyles}
        maxMenuHeight={180}
        isSearchable={false}
        onMenuInputFocus={() => setIsFocused(true)}
        onChange={(e) => { if (teacherApp) {setFieldValue('topic', { label: get(e, 'id') }) }; setIsFocused(false) }}
        {...{
          menuIsOpen: isFocused || undefined,
          isFocused: isFocused || undefined
        }}
      />
    </div>
  );
};

export default TopicDropdown;
