import React, { useState, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';

// Memoized field renderer to prevent unnecessary re-renders
const FormField = React.memo(({ field, hasError }) => {
  const { name, type = 'text', placeholder, rows, options } = field;
  
  const baseClasses = `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
    ${hasError 
      ? 'border-red-200 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
      : 'border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
    }
    placeholder:text-gray-400 text-gray-700 font-medium text-base sm:text-sm
  `;

  if (type === 'textarea') {
    return <Field as="textarea" name={name} placeholder={placeholder} rows={rows || 4} className={baseClasses} />;
  }
  
  if (type === 'select') {
    return (
      <div className="relative">
        <Field as="select" name={name} className={`${baseClasses} appearance-none`}>
          <option value="" className="text-gray-400">Select an option...</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </Field>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    );
  }
  
  return <Field type={type} name={name} placeholder={placeholder} className={baseClasses} />;
});

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const FormikForm = React.memo(({
  initialValues,
  validationSchema,
  onSubmit,
  fields,
  submitLabel = 'Submit',
  successMessage,
  resetAfterSubmit = true,
}) => {
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = useCallback(async (values, formikBag) => {
    const { setSubmitting, resetForm } = formikBag;
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await onSubmit(values, formikBag);
      setSubmitSuccess(true);
      if (resetAfterSubmit) resetForm();
      if (successMessage) setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Submission failed';
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, resetAfterSubmit, successMessage]);

  // Memoize fields to avoid re-rendering on every parent update
  const memoizedFields = useMemo(() => fields, [fields]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-0">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
        {/* Decorative header */}
        <div className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <div className="p-5 sm:p-8 md:p-10">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnMount={true}
          >
            {({ isSubmitting, dirty, isValid, errors, touched }) => (
              <Form className="space-y-5 sm:space-y-6">
                <div className="space-y-4 sm:space-y-5">
                  {memoizedFields.map(field => (
                    <div key={field.name} className="group">
                      <label className="flex items-center justify-between mb-1.5 sm:mb-2 px-1">
                        <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">
                          {field.label}
                          {field.required && <span className="text-indigo-500 ml-1">*</span>}
                        </span>
                      </label>
                      
                      <FormField
                        field={field}
                        hasError={errors[field.name] && touched[field.name]}
                      />
                      
                      <ErrorMessage name={field.name}>
                        {msg => (
                          <div className="flex items-center mt-1.5 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </div>
                  ))}
                </div>

                {/* Status messages */}
                <div aria-live="polite" className="space-y-3">
                  {submitError && (
                    <div className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium animate-in zoom-in-95">
                      <span className="mr-2 sm:mr-3 text-base sm:text-lg">⚠️</span>
                      <span className="flex-1">{submitError}</span>
                    </div>
                  )}
                  {submitSuccess && successMessage && (
                    <div className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-medium animate-in zoom-in-95">
                      <span className="mr-2 sm:mr-3 text-base sm:text-lg">✨</span>
                      <span className="flex-1">{successMessage}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !dirty || !isValid}
                  className={`
                    relative w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300
                    flex items-center justify-center gap-2 sm:gap-3
                    ${(!isValid || isSubmitting) 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 touch-manipulation'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>{submitLabel}</span>
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <p className="text-center mt-4 sm:mt-6 text-gray-400 text-[11px] sm:text-xs">
        All sensitive data is encrypted before submission.
      </p>
    </div>
  );
});

FormikForm.displayName = 'FormikForm';

export default FormikForm;