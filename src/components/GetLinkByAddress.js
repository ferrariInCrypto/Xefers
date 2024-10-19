import { Card, Col, Row, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { getExplorerUrl, getDateStringFromTimestamp } from '../util';
import { getLinksForOwner } from '../util/storeDb';
import { CHAIN_OPTIONS } from '../util/chainInfo';

export default function OwnerLinks({ account, address, activeChain }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [links, setLinks] = useState([]);

    useEffect(() => {
        if (account) {
            getLinks(account);
        }
    }, [account]);

    async function getLinks(address) {
        setLoading(true);
        setError();
        try {
            const res = await getLinksForOwner(address);
            const results = res.data;
            console.log('links', results);
            setLinks(results);
        } catch (e) {
            console.log(e);
            setError('Error getting links: ' + e.message);
        } finally {
            setLoading(false);
        }
    }

    const title = <span className="text-gray-700 ">History of: {account}</span>;

    return (
        <div>
            <div className='centered'>
                <h1>{title}</h1>
            </div>

            <Card className='font-Oxanium mt-8'>
                {loading && <Spin tip="Loading..." />}
                {!loading && links.length === 0 && <p>No links found.</p>}
                {error && <p className='error-text'>{error}</p>}

                {links.length > 0 && (
                    <p><b>Total: {links.length}</b></p>
                )}
                
                <Row gutter={16}>
                    {links.map((link, i) => {
                        const { data } = link;
                        const explorerUrl = getExplorerUrl(activeChain, data.id);
                        const network = CHAIN_OPTIONS[data.chainId]?.name;

                        return (
                            <Col span={8} key={i} style={{ marginBottom: '16px' }}>
                                <Card
                                    title={data.title}
                                    bordered={true}
                                    className="transition-transform font-Oxanium transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                                    onClick={() => {
                                        console.log('clicked', data);
                                        window.open(explorerUrl, '_blank');
                                    }}
                                >
                                    <p className='  font-semibold text-gray-500'>
                                        URL: <a href={data.redirectUrl} target="_blank" rel="noreferrer">{data.redirectUrl}</a><br />
                                        {network && <span>Network: {network}</span>}<br />
                                        {!isNaN(data.createdAt) && <span>Date: {getDateStringFromTimestamp(data.createdAt, true)}</span>}
                                    </p>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Card>
        </div>
    );
}
