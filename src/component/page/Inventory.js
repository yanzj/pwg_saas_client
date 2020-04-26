import React, {useState, useEffect} from 'react';
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Button, Table, Tag, message } from 'antd';
import {
  PlusOutlined
} from '@ant-design/icons';
import Page_01 from './component/Page_01';
import Loading from '../../utils/component/Loading';


const GET_PRODUCTS_QUERY = gql`
  query products($filter: JSONObject) {
    products(filter: $filter) {
      _id
      createdAt
      updatedAt
      name
      description
      variants
      published
    }
  }
`;

const READ_PRODUCT_INVENTORY_QUERY = gql`
  query inventory($filter: JSONObject) {
    inventory(filter: $filter) {
      _id
      createdAt
      updatedAt
      price
      stock
      variants
      published
      productId
    }
  }
`;

const UPDATE_PRODUCT_PUBLISH = gql`
  mutation updateProductPublish($ids: [String!], $published: Boolean!) {
    updateProductPublish(ids: $ids, published: $published) {
      success
      message
      data
    }
  }
`;

const UPDATE_INVENTORY_PUBLISH = gql`
  mutation updateInventoryPublish($ids: [String!], $published: Boolean!) {
    updateInventoryPublish(ids: $ids, published: $published) {
      success
      message
      data
    }
  }
`;

const Inventory = (props) => {
  const [ selectedItems, setSelectedItems ] = useState([]);
  const [ displaySelectionPanel, setDisplaySelectionPanel ] = useState(false);

  const { data: productsData, loading, error, refetch: refetchProducts } = useQuery(GET_PRODUCTS_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: {

    },
    onError: (error) => {
      console.log("products error", error)

    },
    onCompleted: (result) => {
      
    }
  });

  const { data: inventoryData, loading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useQuery(READ_PRODUCT_INVENTORY_QUERY, {
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.log("inventoryData error", error)
    },
    onCompleted: (result) => {
      // console.log('inventoryData', result)
    }
  });

  const [updateProductPublish] = useMutation(UPDATE_PRODUCT_PUBLISH,{
    onCompleted: (result) => {
      console.log("updateInventoryPublish result",result)
      refetchProducts();
    }
  });
  const [updateInventoryPublish] = useMutation(UPDATE_INVENTORY_PUBLISH,{
    onCompleted: (result) => {
      console.log("updateInventoryPublish result",result)
      refetchInventory();
    }
  });


  useEffect(()=>{
    if (selectedItems.length > 0) {
      if (!displaySelectionPanel) setDisplaySelectionPanel(true);
    }
    else {
      if (displaySelectionPanel) setDisplaySelectionPanel(false)
    }
  },[selectedItems.length])

  let columns = [
    {
      title: 'No.',
      dataIndex: 'index',
      render: (text, record, index) => {
        return index + 1 + '.';
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => {
        let result = record.name;
        if (!result) {
          let newName = "";
          if (record.variants) {
            
            let variantKeys = Object.keys(record.variants);
            variantKeys.map((aKey, index)=>{
              newName += `${record.variants[aKey]} ${index == variantKeys.length - 1 ? "" : "/ "}`
            })
          }
          result = newName;
        }
        return result;
      }
    },
    {
      title: 'Price',
      dataIndex: 'price',
      sorter: (a, b) => {
        return a.price > b.price
      },
      render: (text, record) => {
        let result = record.price;
        if (!result) {
          result = '-';
        }
        return result;
      }
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      sorter: (a, b) => {
        if (a.stock && b.stock) {
          return a.stock - b.stock
        }
        return 0;
      },
      render: (text, record) => {
        let result = record.stock;
        if (!result) {
          if (record.children && record.children.length > 0) {
            let sum = 0;
            record.children.map((aChild)=>{sum += aChild.stock});
            result = sum;
          }
          else {
            result = '-';
          }
        }
        return result;
      }
    },
    {
      title: 'Published',
      dataIndex: 'published',
      render: (text, record) => {
        return (
          record.published ? <Tag color="green">On</Tag> : <Tag color="red">Off</Tag>
        )
      } 
    }
  ]

  

  const selectionPanel = () => {
    let inventoryIds = [];
    let productIds = [];
    selectedItems.map((anItem)=>{
      if (anItem.productId && anItem.productId != "") {
        inventoryIds.push(anItem._id)
      }
      else {
        productIds.push(anItem._id)
      }
    });
  
    const updateToPublish = () => {
      if (inventoryIds.length > 0) {
        updateInventoryPublish({
          variables: {
            ids: inventoryIds,
            published: true
          }
        })
      }
      if (productIds.length > 0) {
        updateProductPublish({
          variables: {
            ids: productIds,
            published: true
          }
        })
      }
    }
    const updateToUnpublish = () => {
      if (inventoryIds.length > 0) {
        updateInventoryPublish({
          variables: {
            ids: inventoryIds,
            published: false
          }
        })
      }
      if (productIds.length > 0) {
        updateProductPublish({
          variables: {
            ids: productIds,
            published: false
          }
        })
      }
    }
    return (
      <div style={{display: 'flex'}}>
        <Button type="primary" size="small" onClick={updateToPublish} style={{marginRight: '5px'}} disabled={!displaySelectionPanel}>Publish</Button>
        <Button size="small" onClick={updateToUnpublish} disabled={!displaySelectionPanel}>Unpublish</Button>
      </div>
    )
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedItems(selectedRows);
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
      // console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      // console.log(selected, selectedRows, changeRows);
    },
  };

  const getTableData = () => {
    let result = [];
    if (productsData && inventoryData && !error && !inventoryError) {
      let inventoryWithKey = inventoryData.inventory.map((anInventory)=>{ return {...anInventory, key: anInventory._id} });
      productsData.products.map((aProduct,index)=>{
        let productInventory = inventoryWithKey.filter((anInventory)=>anInventory.productId == aProduct._id);
        aProduct['key'] = aProduct._id;
        if (productInventory.length > 0) {
          aProduct['children'] = productInventory;
        }
        result.push(aProduct)
      });
    }
    return result;
  }

  let hasSelected = selectedItems.length > 0 ? true : false;

  return (
    <Page_01
      title={"Inventory"}
      //extra={[
      //  <Button key="create" type="primary" icon={<PlusOutlined />} />
      //]}
    >
      <Table 
        columns={columns} 
        rowSelection={rowSelection} 
        dataSource={getTableData()} 
        pagination={false}
      />
      <div className={`inventory-selectionPanel ${displaySelectionPanel ? 'open' : 'close'}`}>
        {selectionPanel()}
      </div>
    </Page_01>
  )
}

export default Inventory;
