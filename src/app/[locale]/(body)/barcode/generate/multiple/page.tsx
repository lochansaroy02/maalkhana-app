"use client";
import { useTranslations } from 'next-intl';


const SingleBarcodePage = () => {
    const t = useTranslations('ui.barcodePage');
    return (
        <div>
            <h2 className='text-xl font-bold mb-4'>{t('multipleTitle')}</h2>
        </div>
    )
}

export default SingleBarcodePage