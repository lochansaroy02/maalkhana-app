"use client";
import { useTranslations } from 'next-intl';


const SingleBarcodePage = () => {
    const t = useTranslations('ui.barcodePage');
    return (
        <div>
            <h2 className='text-xl font-bold mb-4'>{t('singleTitle')}</h2>
            {/* Add your form or content for the SINGLE generator here */}
        </div>
    )
}

export default SingleBarcodePage