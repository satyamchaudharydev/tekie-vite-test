import React from 'react'
import Select from 'react-select'

export const customStyles = {
  option: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: '13px',
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    minHeight: '32px',
    maxHeight: '32px',
    border: '1px solid #AAAAAA',
    boxShadow: '0 0 0 0px black',
    borderRadius: '8px',
    '&:hover' : {
      border: '1px solid #AAAAAA',
      boxShadow: '0 0 0 0px black',
    }
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: '13px',
    top: '45%',
    color: 'black',
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: '13px',
    top: '45%',
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    padding: '4px 8px 8px',
    color: '#0c0c0c',
    height: '16',
    width: '16',
    '&:hover': {
      color: '#0c0c0c'
    },
    'svg > path': {
      height: '16',
    }
  })
}

const Dropdown = ({
    isMulti,
    options,
    defaultValues,
    closeMenuOnSelect,
    name,
    className,
    classNamePrefix,
    components,
    isClearable,
    isSearchable,
    placeholder,
    styles,
    onChange,
    value,
    disabled
  }) => (
    <Select
      value={value}
      defaultValue={defaultValues}
      isMulti={isMulti}
      name={name}
      closeMenuOnSelect={closeMenuOnSelect}
      options={options}
      styles={styles ? styles: customStyles}
      className={className}
      classNamePrefix={classNamePrefix}
      components={components ? components : null}
      isClearable={isClearable}
      isSearchable={isSearchable}
      placeholder={placeholder}
      onChange={onChange}
      isDisabled={disabled}
    />
  );
  
Dropdown.defaultProps = {
  defaultValues: [],
  isMulti: false,
  name: 'select',
  closeMenuOnSelect:true,
  options: [],
  className: 'react-select',
  classNamePrefix: 'react-select',
  showAnimations: false,
  isClearable: false,
  isSearchable: true,
  placeholder: 'Search...',
  styles: null,
  onChange: () => null,
  disabled: false,
};

export default Dropdown