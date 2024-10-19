import { Card } from 'antd'
import React, { useEffect, useState } from 'react'
import { getExplorerUrl, getDateStringFromTimestamp } from '../util'
import { getLinksForOwner } from '../util/db'
import { CHAIN_OPTIONS } from '../util/constants'

export default function OwnerLinks({ account, address, activeChain }) {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = useState()
    const [links, setLinks] = useState([])


    useEffect(() => {
        if (account) {
            getLinks(account)
        }
    }, [account])

    async function getLinks(address) {
        setLoading(true)
        setError()
        try {
            const res = await getLinksForOwner(address)
            const results = res.data
            console.log('links', results)
            setLinks(results)
        } catch (e) {
            console.log(e)
            setError('Error getting links: ' + e.message)
        }
        finally {
            setLoading(false)
        }
    }

    const title = <span>History of : {account}</span>

    return (<div>
        <div className='centered'>
            
        

        </div>

        <Card className='font-Ubuntu'
            title={title}>
            {loading && <p>Loading...</p>}
            {!loading && links?.length === 0 && <p>No links found.</p>}
            {error && <p className='error-text'>{error}</p>}

            {links?.length > 0 && <p><b>Total : ({links?.length || 0})</b></p>}
            {links?.map((link, i) => {
                const { data } = link
                const explorerUrl = getExplorerUrl(activeChain, data.id)
                const network = CHAIN_OPTIONS[data.chainId]?.name
                // Create a padded box
                // id is address
                return (
                    <div key={i} className="link-row" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}
                        onClick={() => {
                            console.log('clicked', data)
                            window.open(explorerUrl, '_blank')
                        }}
                    >
                        <h2>
                            Campaign Title: {data.title}</h2>
                        <p>
                             URL: {data.redirectUrl}<br />
                            {network && <span>Network: {network}</span>}<br />
                            {!isNaN(data.createdAt) && <span>Date: {getDateStringFromTimestamp(data.createdAt, true)}</span>}
                        </p>
                    </div>
                )
            })}
        </Card>
    </div>
    )
}
